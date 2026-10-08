import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

type LicenseType = 'monthly' | 'quarterly' | 'yearly';
type LicenseStatus = 'active' | 'expired' | 'revoked';

type License = {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  productName: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  issuedAt: string;
  activationDate: string;
  expiresAt: string;
  maxActivations: number;
  notes: string;
  activationCount: number;
  licenseKey: string;
  activatedDeviceHashes: string[];
  signature: string;
  publicKeyId: string;
};

type LicenseStore = {
  list: (options: { prefix: string }) => Promise<{ blobs: Array<{ key: string }> }>;
  get: (key: string, options: { type: 'json' }) => Promise<unknown>;
  setJSON: (
    key: string,
    value: unknown,
    options?: { onlyIfNew?: boolean },
  ) => Promise<unknown>;
};

const LICENSE_DAYS: Record<LicenseType, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

const response = (body: unknown, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });

const isAuthorized = (request: Request) => {
  const expected = process.env.LICENSE_ADMIN_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
};

const getSigningKey = () => {
  const value = process.env.LICENSE_PRIVATE_KEY;
  if (!value) throw new Error('LICENSE_PRIVATE_KEY is not configured');
  return crypto.createPrivateKey(value.replace(/\\n/g, '\n'));
};

const signaturePayload = (license: License) => ({
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
  activatedDeviceHashes: license.activatedDeviceHashes,
});

const canonicalPayload = (license: License) =>
  Buffer.from(JSON.stringify(signaturePayload(license), Object.keys(signaturePayload(license)).sort()));

const signLicense = (license: License) =>
  crypto.sign(null, canonicalPayload(license), getSigningKey()).toString('base64');

const hasValidSignature = (license: License) =>
  crypto.verify(
    null,
    canonicalPayload(license),
    crypto.createPublicKey(getSigningKey()),
    Buffer.from(license.signature, 'base64'),
  );

const publicLicense = ({ signature: _signature, activatedDeviceHashes: _deviceHashes, ...license }: License) =>
  license;

const validText = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

const isLicenseType = (value: unknown): value is LicenseType =>
  typeof value === 'string' && Object.hasOwn(LICENSE_DAYS, value);

const isLicense = (value: unknown): value is License => {
  if (!value || typeof value !== 'object') return false;
  const license = value as Partial<License>;
  return typeof license.id === 'string' &&
    typeof license.customerId === 'string' &&
    typeof license.customerName === 'string' &&
    typeof license.email === 'string' &&
    typeof license.productName === 'string' &&
    isLicenseType(license.licenseType) &&
    (license.status === 'active' || license.status === 'expired' || license.status === 'revoked') &&
    typeof license.issuedAt === 'string' &&
    typeof license.activationDate === 'string' &&
    typeof license.expiresAt === 'string' &&
    Number.isInteger(license.maxActivations) &&
    typeof license.notes === 'string' &&
    Number.isInteger(license.activationCount) &&
    typeof license.licenseKey === 'string' &&
    Array.isArray(license.activatedDeviceHashes) &&
    license.activatedDeviceHashes.every((hash) => typeof hash === 'string') &&
    typeof license.signature === 'string' &&
    typeof license.publicKeyId === 'string';
};

const getLicenses = async (store: LicenseStore) => {
  const { blobs } = await store.list({ prefix: 'license-' });
  const licenses = await Promise.all(
    blobs.map(async ({ key }) => {
      const value = await store.get(key, { type: 'json' });
      return isLicense(value) ? value : null;
    }),
  );
  return licenses
    .filter((license): license is License => license !== null)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
};

const saveLicense = (store: LicenseStore, license: License) =>
  store.setJSON(`license-${license.id}`, license);

const parseBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const getDeviceHash = (deviceId: unknown) =>
  validText(deviceId, 256)
    ? crypto.createHash('sha256').update(deviceId.trim()).digest('hex')
    : null;

const lookupLicense = async (store: LicenseStore, licenseKey: string) =>
  (await getLicenses(store)).find((license) => license.licenseKey === licenseKey) ?? null;

const validateLicense = async (
  store: LicenseStore,
  license: License,
  deviceHash: string,
  allowNewDevice: boolean,
) => {
  if (!hasValidSignature(license)) {
    return response({ error: 'License signature is invalid.' }, 400);
  }
  if (license.status === 'revoked') {
    return response({ error: 'License has been revoked.' }, 403);
  }
  if (new Date(license.expiresAt).getTime() <= Date.now()) {
    if (license.status !== 'expired') {
      license.status = 'expired';
      license.signature = signLicense(license);
      await saveLicense(store, license);
    }
    return response({ error: 'License has expired.' }, 410);
  }
  if (!allowNewDevice && license.activatedDeviceHashes.length > 0 &&
      !license.activatedDeviceHashes.includes(deviceHash)) {
    return response({ error: 'This license is not activated on this device.' }, 409);
  }
  return null;
};

export const handleLicenseRequest = async (
  request: Request,
  store: LicenseStore = getStore('license-records'),
): Promise<Response> => {
  if (request.method === 'OPTIONS') return response(null, 204);

  const pathname = new URL(request.url).pathname.replace(/\/+$/, '');
  const endpoint = pathname.split('/').pop();

  try {
    if (endpoint === 'verify' || endpoint === 'activate') {
      if (request.method !== 'POST') {
        return response({ error: 'Method not allowed.' }, 405);
      }

      const body = await parseBody(request);
      if (!body) return response({ error: 'Request body must be valid JSON.' }, 400);

      const licenseKey = typeof body.licenseKey === 'string' ? body.licenseKey.trim().toUpperCase() : '';
      const deviceHash = getDeviceHash(body.deviceId);
      if (!validText(licenseKey, 100) || !deviceHash) {
        return response({ error: 'Enter a valid license key and device ID.' }, 400);
      }

      const license = await lookupLicense(store, licenseKey);
      if (!license) return response({ error: 'License not found.' }, 404);

      const validationError = await validateLicense(
        store,
        license,
        deviceHash,
        endpoint === 'activate',
      );
      if (validationError) return validationError;

      if (endpoint === 'activate' && !license.activatedDeviceHashes.includes(deviceHash)) {
        if (license.activatedDeviceHashes.length >= license.maxActivations) {
          return response({ error: 'This license has reached its activation limit.' }, 409);
        }

        license.activatedDeviceHashes.push(deviceHash);
        license.activationCount = license.activatedDeviceHashes.length;
        license.activationDate = new Date().toISOString();
        license.signature = signLicense(license);
        await saveLicense(store, license);
      }

      return response({
        status: 'valid',
        message: endpoint === 'activate' ? 'License activated.' : 'License is valid.',
        remainingDays: Math.max(
          0,
          Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000),
        ),
        license: publicLicense(license),
      });
    }

    if (endpoint === 'licenses' && request.method === 'GET') {
      if (!isAuthorized(request)) {
        const message = process.env.LICENSE_ADMIN_TOKEN
          ? 'Admin access token is invalid.'
          : 'LICENSE_ADMIN_TOKEN is not configured.';
        return response({ error: message }, process.env.LICENSE_ADMIN_TOKEN ? 401 : 503);
      }
      const licenses = await getLicenses(store);
      return response({ licenses: licenses.map(publicLicense) });
    }

    if (endpoint !== 'generate') {
      return response({ error: 'Endpoint not found.' }, 404);
    }
    if (request.method !== 'POST') {
      return response({ error: 'Method not allowed.' }, 405);
    }
    if (!process.env.LICENSE_ADMIN_TOKEN) {
      return response({ error: 'LICENSE_ADMIN_TOKEN is not configured.' }, 503);
    }
    if (!isAuthorized(request)) {
      return response({ error: 'Admin access token is invalid.' }, 401);
    }

    const body = await parseBody(request);
    if (!body) return response({ error: 'Request body must be valid JSON.' }, 400);

    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const productName = typeof body.productName === 'string' ? body.productName.trim() : '';
    const licenseType = body.licenseType;
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    const maxActivations = Number(body.maxActivations || 1);

    if (!validText(customerName, 120) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !validText(productName, 120) || !isLicenseType(licenseType) || notes.length > 1000 ||
        !Number.isInteger(maxActivations) || maxActivations < 1 || maxActivations > 1000) {
      return response({ error: 'Enter valid customer, email, product, plan, notes, and activation limit.' }, 400);
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + LICENSE_DAYS[licenseType]);

    const license: License = {
      id: crypto.randomUUID(),
      customerId: crypto.randomUUID(),
      customerName,
      email,
      productName,
      licenseType,
      status: 'active',
      issuedAt: now.toISOString(),
      activationDate: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      maxActivations,
      notes,
      activationCount: 0,
      licenseKey: `LIC-${crypto.randomBytes(16).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-')}`,
      activatedDeviceHashes: [],
      signature: '',
      publicKeyId: 'server-ed25519',
    };

    license.signature = signLicense(license);
    await store.setJSON(`license-${license.id}`, license, { onlyIfNew: true });

    return response({
      message: 'License generated successfully.',
      license: publicLicense(license),
    }, 201);
  } catch (error) {
    console.error('License API request failed:', error);
    return response({ error: 'License service is not configured or is temporarily unavailable.' }, 500);
  }
};

export const config = {
  path: [
    '/api/licenses',
    '/api/licenses/generate',
    '/api/licenses/activate',
    '/api/licenses/verify',
  ],
};

export default (request: Request): Promise<Response> => handleLicenseRequest(request);
