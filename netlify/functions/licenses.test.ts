import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { handleLicenseRequest } from './licenses.ts';

class MemoryLicenseStore {
  private readonly records = new Map<string, unknown>();

  async list({ prefix }: { prefix: string }) {
    return {
      blobs: [...this.records.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({ key })),
    };
  }

  async get(key: string, _options: { type: 'json' }): Promise<unknown> {
    return this.records.get(key) ?? null;
  }

  async setJSON(key: string, value: unknown, options?: { onlyIfNew?: boolean }) {
    if (options?.onlyIfNew && this.records.has(key)) {
      throw new Error(`Record already exists: ${key}`);
    }
    this.records.set(key, structuredClone(value));
  }
}

test('hosted license generation, activation limits, and device verification', async (context) => {
  const previousAdminToken = process.env.LICENSE_ADMIN_TOKEN;
  const previousPrivateKey = process.env.LICENSE_PRIVATE_KEY;
  const { privateKey } = crypto.generateKeyPairSync('ed25519');
  process.env.LICENSE_ADMIN_TOKEN = 'test-admin-token';
  process.env.LICENSE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  context.after(() => {
    if (previousAdminToken === undefined) delete process.env.LICENSE_ADMIN_TOKEN;
    else process.env.LICENSE_ADMIN_TOKEN = previousAdminToken;
    if (previousPrivateKey === undefined) delete process.env.LICENSE_PRIVATE_KEY;
    else process.env.LICENSE_PRIVATE_KEY = previousPrivateKey;
  });

  const store = new MemoryLicenseStore();
  const generatedResponse = await handleLicenseRequest(
    new Request('https://licenses.example/api/licenses/generate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-admin-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Test Customer',
        email: 'customer@example.com',
        productName: 'Crate Generator',
        licenseType: 'monthly',
        maxActivations: 2,
        notes: 'Automated test',
      }),
    }),
    store,
  );
  assert.equal(generatedResponse.status, 201);
  const generated = await generatedResponse.json() as {
    license: { licenseKey: string; activationCount: number };
  };
  assert.match(generated.license.licenseKey, /^LIC-(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
  assert.equal(generated.license.activationCount, 0);

  const activate = (deviceId: string) => handleLicenseRequest(
    new Request('https://licenses.example/api/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: generated.license.licenseKey, deviceId }),
    }),
    store,
  );
  const verify = (deviceId: string) => handleLicenseRequest(
    new Request('https://licenses.example/api/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: generated.license.licenseKey, deviceId }),
    }),
    store,
  );

  const firstActivation = await activate('device-one');
  assert.equal(firstActivation.status, 200);
  assert.equal((await firstActivation.json()).message, 'License activated.');
  assert.equal((await (await verify('device-one')).json()).status, 'valid');

  const secondActivation = await activate('device-two');
  assert.equal(secondActivation.status, 200);
  assert.equal((await secondActivation.json()).license.activationCount, 2);

  const thirdActivation = await activate('device-three');
  assert.equal(thirdActivation.status, 409);
  assert.equal((await thirdActivation.json()).error, 'This license has reached its activation limit.');

  const listedWithoutAdminToken = await handleLicenseRequest(
    new Request('https://licenses.example/api/licenses'),
    store,
  );
  assert.equal(listedWithoutAdminToken.status, 401);
});
