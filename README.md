# Secure License Management System

This workspace now includes a production-oriented license management system for a desktop application with:

- Monthly, quarterly, and yearly subscription plans
- Hardware-based device binding using SHA-256
- Ed25519 signing for license integrity
- Encrypted local license storage
- Offline support with server synchronization
- Admin dashboard for generating and managing licenses
- Client SDK for app integration
- PostgreSQL/MySQL-ready schema and API documentation

## Architecture

- Backend API: Express service in `server/index.ts`
- Admin UI: `server/public/admin.html`
- Client SDK: `src/lib/license-sdk.ts`
- Database schema: `docs/database.sql`
- API docs: `docs/api.md`
- Deployment guide: `docs/deployment.md`
- Security guide: `docs/security-best-practices.md`
- Testing guide: `docs/testing.md`

## Quick Start

1. Install dependencies:
   `npm install`
2. Start the license server:
   `npm run license-server`
3. Open the admin dashboard:
   `http://localhost:4000/admin`
4. Start the frontend app if needed:
   `npm run dev`
5. (Optional) Generate a signing key pair:
   `npm run generate-license-keys`

## License Types

- Monthly: 30 days
- Quarterly: 90 days
- Yearly: 365 days

## Core API Endpoints

- POST `/api/licenses/generate`
- POST `/api/licenses/activate`
- POST `/api/licenses/verify`
- POST `/api/licenses/renew`
- POST `/api/licenses/revoke`
- POST `/api/licenses/deactivate-device`
- GET `/api/licenses/:id`

## Security Model

- Private signing keys exist only on the backend.
- Device IDs are hashed with SHA-256 before storage.
- License payloads are signed with Ed25519.
- Local license files are encrypted before saving.
- Production traffic should use HTTPS only.

## Notes

The included backend is a secure reference implementation for local/demo deployment. For a production deployment, move to PostgreSQL or MySQL, add TLS termination, store secrets securely, and enable audit logging and monitoring.
