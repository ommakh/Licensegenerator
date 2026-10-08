export type LicenseType = 'monthly' | 'quarterly' | 'yearly';

export type LicenseStatus = 'active' | 'expired' | 'revoked';

export interface LicenseRecord {
  id: string;
  licenseKey: string;
  customerName: string;
  email: string;
  productName: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  issuedAt: string;
  activationDate: string;
  expiresAt: string;
  maxActivations: number;
  notes?: string;
  activationCount: number;
  activatedDeviceHash?: string | null;
}

export interface LicenseVerificationResult {
  status: 'valid' | 'invalid' | 'expired' | 'revoked' | 'device-mismatch';
  message: string;
  remainingDays?: number;
  license?: LicenseRecord;
}

export class SecureLicenseClient {
  private readonly baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_LICENSE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async activateLicense(licenseKey: string, deviceId: string): Promise<{ message: string; status: string; remainingDays: number; license: LicenseRecord }> {
    const response = await fetch(`${this.baseUrl}/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Activation failed');
    return data;
  }

  async verifyLicense(licenseKey: string, deviceId: string): Promise<LicenseVerificationResult> {
    const response = await fetch(`${this.baseUrl}/licenses/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceId }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        status: 'invalid',
        message: data.error || 'Verification failed',
      };
    }

    return {
      status: 'valid',
      message: data.message,
      remainingDays: data.remainingDays,
      license: data.license,
    };
  }

  async getLicenseInfo(licenseKey: string): Promise<LicenseRecord> {
    const result = await this.verifyLicense(licenseKey, getDeviceFingerprint());
    if (result.status !== 'valid' || !result.license) throw new Error(result.message);
    return result.license;
  }

  async getRemainingDays(licenseKey: string): Promise<number> {
    const license = await this.getLicenseInfo(licenseKey);
    const expiry = new Date(license.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((expiry - now) / 86400000));
  }

  async renewLicense(licenseKey: string, newLicenseType: LicenseType): Promise<{ message: string; license: LicenseRecord }> {
    const response = await fetch(`${this.baseUrl}/licenses/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, newLicenseType }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Renewal failed');
    return data;
  }
}

export const secureLicenseClient = new SecureLicenseClient();

export const getDeviceFingerprint = (): string => {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
  ];
  return btoa(parts.join('|')).replace(/=+$/g, '');
};
