# Secure License Management System

This workspace includes a hosted license service and a wooden crate configurator with:

- Monthly, quarterly, and yearly subscription plans
- Online license activation and verification shared across customer systems
- Configurable per-license device activation limits
- Ed25519 signing for license integrity
- Persistent license records in Netlify Blobs
- Admin dashboard for generating and managing licenses
- Local Express server for development and testing

## Architecture

- Hosted API: Netlify function in `netlify/functions/licenses.ts`
- Local API: Express service in `server/index.ts`
- Admin UI: `server/public/admin.html`, served at `/admin`
- Customer app: Vite/React application in `src/`
- Client SDK: `src/lib/license-sdk.ts`

## Quick Start

1. Install dependencies:
   `npm install`
2. Start the license server:
   `npm run license-server`
3. Open the local admin dashboard:
   `http://localhost:4000/admin`
4. Start the frontend app:
   `npm run dev`
5. Run license API tests:
   `npm run test:licenses`

Local licenses are stored only in `server/data` and cannot be verified by the
hosted service. Use the hosted `/admin` page to issue licenses for customers.

## Deploy the License Generator to Netlify

The included `netlify.toml` builds the customer app and admin page and routes
license API requests through the Netlify function. The app uses same-origin
`/api` requests in production, so customers share the hosted license service.

Set these Netlify environment variables before deploying:

- `LICENSE_ADMIN_TOKEN`: a long, random secret used only in the admin dashboard.
- `LICENSE_PRIVATE_KEY`: the complete Ed25519 private key from
  `server/keys/private.pem`. Keep it secret and out of Git.

Make the production site publicly accessible so customer browsers can reach
the app and public license validation routes. Keep the admin API protected by
`LICENSE_ADMIN_TOKEN`. After deployment, visit `/admin` and issue licenses
there; those records are shared across customers through Netlify Blobs.

For an app build hosted on a different origin, set
`VITE_LICENSE_API_URL` to the hosted site's `/api` base URL before building.
Do not place either Netlify secret in a `VITE_` variable.

## License Types

- Monthly: 30 days
- Quarterly: 90 days
- Yearly: 365 days

## Local License API Endpoints

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

The Netlify function supports admin listing/generation and public activation/
verification. New keys contain 128 bits of randomness. `maxActivations`
controls how many distinct customer devices may activate one license.
