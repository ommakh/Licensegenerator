import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const keysDir = path.join(root, 'server', 'keys');
const publicPath = path.join(keysDir, 'public.pem');
const privatePath = path.join(keysDir, 'private.pem');

fs.mkdirSync(keysDir, { recursive: true });

if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  fs.writeFileSync(privatePath, privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());
  fs.writeFileSync(publicPath, publicKey.export({ type: 'spki', format: 'pem' }).toString());
  console.log('New Ed25519 key pair generated at server/keys');
} else {
  console.log('Existing signing keys found at server/keys');
}

const licenseType = 'monthly';
const payload = {
  id: crypto.randomUUID(),
  licenseKey: 'LIC-TEST-0001',
  customerName: 'Demo Customer',
  email: 'demo@example.com',
  productName: 'Secure Desktop App',
  licenseType,
  status: 'active',
  issuedAt: new Date().toISOString(),
  activationDate: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  maxActivations: 1,
  notes: 'Sample generated license',
  activationCount: 0,
  activatedDeviceHash: null,
};

const privateKey = crypto.createPrivateKey(fs.readFileSync(privatePath, 'utf8'));
const signature = crypto.sign(null, Buffer.from(JSON.stringify(payload, Object.keys(payload).sort())), privateKey).toString('base64');

console.log(JSON.stringify({
  publicKeyPath: publicPath,
  privateKeyPath: privatePath,
  sampleLicense: {
    ...payload,
    signature,
  },
}, null, 2));
