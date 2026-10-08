# Testing Guide

## Automated Test Cases

- Valid license
- Invalid license
- Expired license
- Device mismatch
- Offline validation
- Server unavailable
- Renewal
- Revocation
- Date rollback
- Tampered license
- High-volume activation requests

## Suggested Test Strategy

### Unit Tests

- Verify hash generation for device fingerprints.
- Verify expiry calculations for monthly, quarterly, and yearly plans.
- Test signature generation and verification.

### Integration Tests

- Test the full activation lifecycle through the API.
- Check license revocation and expiry transitions.
- Confirm local encrypted license cache works after activation.

### Failure Simulation

- Simulate offline mode by disabling network calls.
- Simulate tampering by modifying an encrypted or signed file.
- Simulate clock rollback by adjusting server or local time in a controlled lab environment.

### Performance Tests

- Run 1000 sequential activation requests.
- Validate the system remains stable under concurrent license checks.
- Confirm the database retains fast lookup times with indexes in place.
