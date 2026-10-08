import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import express from 'express';

const app = express();
const PORT = Number(process.env.LICENSE_PORT || 4000);
const SERVER_ROOT = process.cwd();
const DATA_DIR = path.join(SERVER_ROOT, 'server', 'data');
const KEYS_DIR = path.join(SERVER_ROOT, 'server', 'keys');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const CUSTOMER_FILE = path.join(DATA_DIR, 'customers.json');
const DEVICE_FILE = path.join(DATA_DIR, 'devices.json');
const ACTIVATIONS_FILE = path.join(DATA_DIR, 'activations.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');
const LOCAL_LICENSE_FILE = path.join(DATA_DIR, 'local-license.enc');
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'change-me-in-production';

const LICENSE_TYPES: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

const LICENSE_STATUS = ['active', 'expired', 'revoked'];

const safeReadJson = <T>(filePath: string, fallback: T): T => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
};

const ensureDirs = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(KEYS_DIR, { recursive: true });
};

const ensureKeys = () => {
  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey.export({ type: 'spki', format: 'pem' }).toString());
  }
};

const getPrivateKey = () => crypto.createPrivateKey(fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'));
const getPublicKey = () => crypto.createPublicKey(fs.readFileSync(PUBLIC_KEY_PATH, 'utf8'));

const signPayload = (payload: Record<string, unknown>) => {
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.sign(null, Buffer.from(normalized, 'utf8'), getPrivateKey()).toString('base64');
};

const verifyPayloadSig = (payload: Record<string, unknown>, signature: string) => {
  try {
    const normalized = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.verify(null, Buffer.from(normalized, 'utf8'), getPublicKey(), Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
};

const generateId = () => crypto.randomUUID();

const toTitle = (value: string) => value.trim().replace(/\s+/g, ' ');

const calculateExpiry = (licenseType: keyof typeof LICENSE_TYPES, activationDate: Date) => {
  const days = LICENSE_TYPES[licenseType] ?? 30;
  const expiry = new Date(activationDate);
  expiry.setUTCDate(expiry.getUTCDate() + days);
  return expiry.toISOString();
};

const makeLicenseKey = () => {
  const random = crypto.randomBytes(16).toString('hex').toUpperCase();
  const groups = random.match(/.{4}/g) ?? [];
  return `LIC-${groups.join('-')}`;
};

const getDeviceId = () => {
  const hardwareParts = [
    os.hostname(),
    os.platform(),
    os.release(),
    os.arch(),
    os.cpus().map((cpu) => cpu.model).join('|'),
    os.totalmem().toString(),
  ];

  const addIfAvailable = (value?: string) => {
    if (value && value.trim()) hardwareParts.push(value.trim());
  };

  try {
    addIfAvailable(fs.existsSync('/sys/class/dmi/id/product_uuid') ? fs.readFileSync('/sys/class/dmi/id/product_uuid', 'utf8').trim() : undefined);
    addIfAvailable(fs.existsSync('/sys/class/dmi/id/bios_uuid') ? fs.readFileSync('/sys/class/dmi/id/bios_uuid', 'utf8').trim() : undefined);
    addIfAvailable(fs.existsSync('/etc/machine-id') ? fs.readFileSync('/etc/machine-id', 'utf8').trim() : undefined);
  } catch {
    // ignored; best effort only
  }

  const fallback = hardwareParts.join('|');
  return crypto.createHash('sha256').update(fallback).digest('hex');
};

const getLicenseTypeDays = (licenseType: string) => LICENSE_TYPES[licenseType] ?? 30;

const licensePayload = (license: any) => ({
  id: license.id,
  licenseKey: license.licenseKey,
  customerName: license.customerName,
  email: license.email,
  productName: license.productName,
  licenseType: license.licenseType,
  status: license.status,
  issuedAt: license.issuedAt,
  activationDate: license.activationDate,
  expiresAt: license.expiresAt,
  maxActivations: license.maxActivations,
  notes: license.notes,
  activationCount: license.activationCount,
  activatedDeviceHash: license.activatedDeviceHash ?? null,
});

const sanitizeLicense = (license: any) => ({
  ...license,
  signature: undefined,
  publicKeyId: undefined,
});

const loadStore = () => ({
  customers: safeReadJson(CUSTOMER_FILE, []),
  licenses: safeReadJson(LICENSES_FILE, []),
  devices: safeReadJson(DEVICE_FILE, []),
  activations: safeReadJson(ACTIVATIONS_FILE, []),
  audit: safeReadJson(AUDIT_FILE, []),
});

const writeStore = (store: ReturnType<typeof loadStore>) => {
  fs.writeFileSync(CUSTOMER_FILE, JSON.stringify(store.customers, null, 2));
  fs.writeFileSync(LICENSES_FILE, JSON.stringify(store.licenses, null, 2));
  fs.writeFileSync(DEVICE_FILE, JSON.stringify(store.devices, null, 2));
  fs.writeFileSync(ACTIVATIONS_FILE, JSON.stringify(store.activations, null, 2));
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(store.audit, null, 2));
};

const addAudit = (store: ReturnType<typeof loadStore>, action: string, entityType: string, entityId: string, details: Record<string, unknown>) => {
  store.audit.push({
    id: generateId(),
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  });
};

const generateDemoCustomer = () => {
  const store = loadStore();
  if (store.customers.length > 0) return;

  const customer = {
    id: generateId(),
    name: 'Demo Enterprise',
    email: 'admin@example.com',
    createdAt: new Date().toISOString(),
  };

  store.customers.push(customer);

  const licenseId = generateId();
  const activationDate = new Date();
  const licenseType = 'monthly';
  const expiry = calculateExpiry(licenseType, activationDate);
  const license: any = {
    id: licenseId,
    customerId: customer.id,
    customerName: customer.name,
    email: customer.email,
    productName: 'Secure Desktop Application',
    licenseType,
    status: 'active',
    issuedAt: activationDate.toISOString(),
    activationDate: activationDate.toISOString(),
    expiresAt: expiry,
    maxActivations: 1,
    notes: 'Seeded demo license for local testing.',
    activationCount: 0,
    licenseKey: makeLicenseKey(),
    activatedDeviceHash: null,
    signature: '',
    publicKeyId: 'server-ed25519',
  };

  license.signature = signPayload(licensePayload(license));
  store.licenses.push(license);
  addAudit(store, 'seed_demo_license', 'license', license.id, { licenseKey: license.licenseKey });
  writeStore(store);
};

const upsertLicenseRecord = (license: any) => {
  const store = loadStore();
  const foundIndex = store.licenses.findIndex((item: any) => item.id === license.id);
  if (foundIndex >= 0) {
    store.licenses[foundIndex] = license;
  } else {
    store.licenses.push(license);
  }
  writeStore(store);
};

const upsertDeviceRecord = (licenseId: string, deviceHash: string) => {
  const store = loadStore();
  const record = {
    id: generateId(),
    licenseId,
    deviceHash,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'bound',
  };

  const existingIndex = store.devices.findIndex((item: any) => item.licenseId === licenseId);
  if (existingIndex >= 0) {
    store.devices[existingIndex] = { ...store.devices[existingIndex], deviceHash, lastSeenAt: record.lastSeenAt, status: 'bound' };
  } else {
    store.devices.push(record);
  }
  writeStore(store);
};

const readEncryptedLicenseFile = () => {
  try {
    const content = fs.readFileSync(LOCAL_LICENSE_FILE, 'utf8');
    const salt = Buffer.from(process.env.LICENSE_SECRET || 'change-me-in-production', 'utf8');
    return JSON.parse(crypto.createDecipheriv('aes-256-cbc', crypto.createHash('sha256').update(salt).digest(), Buffer.alloc(16, 0)).update(content, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

const saveEncryptedLicenseFile = (payload: Record<string, unknown>) => {
  try {
    const secret = crypto.createHash('sha256').update(LICENSE_SECRET).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]).toString('base64');
    fs.writeFileSync(LOCAL_LICENSE_FILE, `${iv.toString('hex')}:${encrypted}`);
  } catch {
    // local file storage is best effort in demo mode
  }
};

const getLicenseByKey = (licenseKey: string) => {
  const store = loadStore();
  return store.licenses.find((item: any) => item.licenseKey === licenseKey) ?? null;
};

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'License service running', timestamp: new Date().toISOString() });
});

app.get('/api/licenses', (_req, res) => {
  const store = loadStore();
  res.json({
    licenses: store.licenses.map((license: any) => ({
      ...sanitizeLicense(license),
      signature: undefined,
    })),
  });
});

app.get('/api/licenses/:id', (req, res) => {
  const store = loadStore();
  const license = store.licenses.find((item: any) => item.id === req.params.id);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }
  return res.json({ license: sanitizeLicense(license) });
});

app.post('/api/licenses/generate', (req, res) => {
  const { customerName, email, productName, licenseType, notes, maxActivations } = req.body;
  const normalizedName = toTitle(customerName || 'Customer');
  const normalizedEmail = (email || '').trim();
  const normalizedProduct = toTitle(productName || 'Secure Desktop Application');
  const normalizedType = (licenseType || 'monthly').toLowerCase();

  if (!['monthly', 'quarterly', 'yearly'].includes(normalizedType)) {
    return res.status(400).json({ error: 'Unsupported license type. Use monthly, quarterly, or yearly.' });
  }

  const activationDate = new Date();
  const expiryDate = calculateExpiry(normalizedType, activationDate);
  const store = loadStore();
  const customer = {
    id: generateId(),
    name: normalizedName,
    email: normalizedEmail,
    createdAt: activationDate.toISOString(),
  };
  store.customers.push(customer);

  const license: any = {
    id: generateId(),
    customerId: customer.id,
    customerName: normalizedName,
    email: normalizedEmail,
    productName: normalizedProduct,
    licenseType: normalizedType,
    status: 'active',
    issuedAt: activationDate.toISOString(),
    activationDate: activationDate.toISOString(),
    expiresAt: expiryDate,
    maxActivations: Number(maxActivations || 1),
    notes: notes || 'Generated by admin dashboard',
    activationCount: 0,
    licenseKey: makeLicenseKey(),
    activatedDeviceHash: null,
    signature: '',
    publicKeyId: 'server-ed25519',
  };

  license.signature = signPayload(licensePayload(license));
  store.licenses.push(license);
  addAudit(store, 'generate_license', 'license', license.id, { customerEmail: normalizedEmail, licenseType: normalizedType });
  writeStore(store);

  return res.status(201).json({
    message: 'License generated successfully',
    license: sanitizeLicense(license),
  });
});

app.post('/api/licenses/activate', (req, res) => {
  const { licenseKey, deviceId } = req.body;
  const store = loadStore();
  const license = store.licenses.find((item: any) => item.licenseKey === licenseKey);

  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  const payload = licensePayload(license);
  if (!verifyPayloadSig(payload, license.signature)) {
    return res.status(400).json({ error: 'Invalid license signature' });
  }

  if (license.status === 'revoked') {
    return res.status(403).json({ error: 'License revoked' });
  }

  if (new Date(license.expiresAt).getTime() < Date.now()) {
    license.status = 'expired';
    writeStore(store);
    return res.status(410).json({ error: 'License expired' });
  }

  const deviceHash = crypto.createHash('sha256').update(String(deviceId || getDeviceId())).digest('hex');
  if (license.activatedDeviceHash && license.activatedDeviceHash !== deviceHash) {
    return res.status(409).json({ error: 'Device mismatch' });
  }

  if (license.activationCount >= (license.maxActivations || 1)) {
    return res.status(409).json({ error: 'Activation limit reached' });
  }

  license.activatedDeviceHash = deviceHash;
  license.activationCount += 1;
  license.status = 'active';
  license.activationDate = new Date().toISOString();
  license.signature = signPayload(licensePayload(license));
  upsertLicenseRecord(license);
  upsertDeviceRecord(license.id, deviceHash);
  saveEncryptedLicenseFile({
    ...licensePayload(license),
    signature: license.signature,
    deviceHash,
  });

  addAudit(store, 'activate_license', 'license', license.id, { deviceHash, licenseKey });
  writeStore(store);

  return res.json({
    message: 'License activated',
    status: 'active',
    license: sanitizeLicense(license),
    remainingDays: Math.max(0, Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000)),
  });
});

app.post('/api/licenses/verify', (req, res) => {
  const { licenseKey, deviceId } = req.body;
  const store = loadStore();
  const license = store.licenses.find((item: any) => item.licenseKey === licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'Invalid license' });
  }

  if (!verifyPayloadSig(licensePayload(license), license.signature)) {
    return res.status(400).json({ error: 'Invalid license signature' });
  }

  if (license.status === 'revoked') {
    return res.status(403).json({ error: 'License revoked' });
  }

  const deviceHash = crypto.createHash('sha256').update(String(deviceId || getDeviceId())).digest('hex');
  if (license.activatedDeviceHash && license.activatedDeviceHash !== deviceHash) {
    return res.status(409).json({ error: 'Device mismatch' });
  }

  if (new Date(license.expiresAt).getTime() < Date.now()) {
    license.status = 'expired';
    writeStore(store);
    return res.status(410).json({ error: 'License expired' });
  }

  const remainingDays = Math.max(0, Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000));
  return res.json({
    status: 'valid',
    message: 'License activated',
    license: sanitizeLicense(license),
    remainingDays,
  });
});

app.post('/api/licenses/renew', (req, res) => {
  const { licenseKey, newLicenseType } = req.body;
  const normalizedType = String(newLicenseType || '').toLowerCase();
  if (!['monthly', 'quarterly', 'yearly'].includes(normalizedType)) {
    return res.status(400).json({ error: 'Unsupported renewal type' });
  }

  const store = loadStore();
  const license = store.licenses.find((item: any) => item.licenseKey === licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  const currentExpiry = new Date(license.expiresAt);
  const nextExpiry = new Date(Math.max(Date.now(), currentExpiry.getTime()));
  nextExpiry.setUTCDate(nextExpiry.getUTCDate() + getLicenseTypeDays(normalizedType));
  license.licenseType = normalizedType;
  license.expiresAt = nextExpiry.toISOString();
  license.status = 'active';
  license.signature = signPayload(licensePayload(license));
  upsertLicenseRecord(license);
  addAudit(store, 'renew_license', 'license', license.id, { newLicenseType: normalizedType, expiresAt: license.expiresAt });
  writeStore(store);

  return res.json({ message: 'License renewed', license: sanitizeLicense(license) });
});

app.post('/api/licenses/revoke', (req, res) => {
  const { licenseKey } = req.body;
  const store = loadStore();
  const license = store.licenses.find((item: any) => item.licenseKey === licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  license.status = 'revoked';
  license.signature = signPayload(licensePayload(license));
  upsertLicenseRecord(license);
  addAudit(store, 'revoke_license', 'license', license.id, { licenseKey });
  writeStore(store);

  return res.json({ message: 'License revoked', status: 'revoked', license: sanitizeLicense(license) });
});

app.post('/api/licenses/deactivate-device', (req, res) => {
  const { licenseKey } = req.body;
  const store = loadStore();
  const license = store.licenses.find((item: any) => item.licenseKey === licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  license.activatedDeviceHash = null;
  license.activationCount = 0;
  license.signature = signPayload(licensePayload(license));
  upsertLicenseRecord(license);
  addAudit(store, 'deactivate_device', 'device', license.id, { licenseKey });
  writeStore(store);

  return res.json({ message: 'Device deactivated', license: sanitizeLicense(license) });
});

app.use('/admin', express.static(path.join(SERVER_ROOT, 'server', 'public')));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(SERVER_ROOT, 'server', 'public', 'admin.html'));
});

ensureDirs();
ensureKeys();
generateDemoCustomer();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`License management server listening on http://localhost:${PORT}`);
});
