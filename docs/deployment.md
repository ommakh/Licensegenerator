# Deployment Guide

## Local Development

1. Install dependencies:
   npm install
2. Start the license service:
   npm run license-server
3. Open the admin dashboard:
   http://localhost:4000/admin
4. Keep the main app running separately with:
   npm run dev

## Production Deployment

### Backend

- Host on a dedicated Node.js API server or container.
- Place behind NGINX or a load balancer with TLS termination.
- Store secrets in environment variables or a managed vault.

### Database

- Use PostgreSQL for production.
- Create the tables from docs/database.sql.
- Add automated backups and restore testing.

### Reverse Proxy

Example NGINX configuration:

```nginx
server {
  listen 443 ssl;
  server_name api.example.com;

  ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

### Monitoring

- Track API latency and error rates.
- Log all activation, revocation, and renewal requests.
- Alert on failed signature verification and device mismatch patterns.
