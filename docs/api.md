# License Management API Reference

Base URL for production: https://api.example.com/api

## Generate License

POST /licenses/generate

Request body:

```json
{
  "customerName": "Jane Smith",
  "email": "jane@example.com",
  "productName": "Secure Desktop Application",
  "licenseType": "yearly",
  "notes": "Enterprise subscription",
  "maxActivations": 1
}
```

Response:

```json
{
  "message": "License generated successfully",
  "license": {
    "id": "uuid",
    "licenseKey": "LIC-ABCD-1234",
    "status": "active",
    "licenseType": "yearly",
    "expiresAt": "2027-10-02T00:00:00.000Z"
  }
}
```

## Activate License

POST /licenses/activate

Request body:

```json
{
  "licenseKey": "LIC-ABCD-1234",
  "deviceId": "sha256-device-fingerprint"
}
```

Possible responses:

- 200: successful activation
- 400: invalid signature
- 403: revoked license
- 409: device mismatch or activation limit reached
- 410: expired license

## Verify License

POST /licenses/verify

Verifies license signature, expiry, revocation, and device binding.

## Renew License

POST /licenses/renew

```json
{
  "licenseKey": "LIC-ABCD-1234",
  "newLicenseType": "quarterly"
}
```

## Revoke License

POST /licenses/revoke

```json
{
  "licenseKey": "LIC-ABCD-1234"
}
```

## Deactivate Device

POST /licenses/deactivate-device

Admin-only endpoint used to clear a previous device binding.

## Get License Details

GET /licenses/:id

Returns metadata and status for a specific license.

## Security Notes

- All production traffic must use HTTPS.
- The license signing key must remain on the backend.
- Validation must always verify signature first before checking business conditions.
