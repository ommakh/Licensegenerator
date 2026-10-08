# Security Best Practices

## Signing

- Use Ed25519 to sign every generated license payload.
- Keep the private signing key on the backend only.
- Verify signatures before trusting any license data.

## Device Binding

- Generate a deterministic SHA-256 fingerprint from hardware identifiers when available.
- Store the bound device only after server-side validation.
- Reject activation attempts when the bound hash differs from the current device.

## Local Storage

- Store only encrypted license data on the client.
- Protect the local encryption secret with OS-level secure storage when available.
- Detect tampering by comparing the license signature and hash before using the file.

## Revocation and Expiry

- Revoke invalid or compromised licenses immediately.
- Refresh status from the server when online.
- Reject any offline file that fails integrity checks or has an invalid signature.

## Date Rollback Protection

- Use the last successful server timestamp to detect suspicious clock backtracking.
- If online, compare the local date to the server-issued expiry and activation timestamps.
- Reject license use when system time appears to move backward beyond a safe threshold.

## Transport Security

- Require HTTPS for all public API traffic.
- Use TLS 1.2 or higher.
- Add HSTS headers in production.
- Keep certificates renewed automatically.

## Production Notes

- Do not ship private keys with the desktop client.
- Use a dedicated key management service for production signing.
- Rotate keys periodically and maintain a verification history for old keys.
