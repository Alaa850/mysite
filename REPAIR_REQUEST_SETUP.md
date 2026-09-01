# TecPro99 Repair Request Setup

The public page posts only to the same-origin endpoint at `/api/repair-request`. The endpoint is a Vercel Function in `api/repair-request.mjs`; it is the only cloud component that reads CRM or CAPTCHA secrets. The browser never receives `REPAIR_REQUEST_API_KEY` or `TURNSTILE_SECRET_KEY`.

GitHub Pages serves static files only, so it cannot execute the `/api` directory. Deploy this repository to Vercel before enabling production submissions. Vercel automatically serves the page and the two functions from the same origin.

For a CRM that runs on a shop computer, use this stable route:

```text
Website -> Vercel Function -> fixed HTTPS tunnel hostname -> local connector on port 4399 -> CRM on its current port
```

The public website and Vercel configuration never contain the CRM's changing localhost port. A named HTTPS tunnel always targets the connector at `http://127.0.0.1:4399`. The connector reads `.crm-connector.local.json` before every forwarded request, so changing the CRM port requires no website deployment and no connector restart.

## Environment variables

Configure these in Vercel Project Settings, not in `index.html` and not in Git:

| Variable | Purpose |
| --- | --- |
| `REPAIR_REQUEST_MODE` | Set to `mock` for development or `production` to send to the CRM. |
| `REPAIR_REQUEST_API_URL` | HTTPS URL for the TecPro99 CRM request endpoint. |
| `REPAIR_REQUEST_API_KEY` | Secret sent only by the server as `X-API-Key`. |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key. It is exposed only through the configuration endpoint. |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret used only for Siteverify. |
| `TURNSTILE_EXPECTED_HOSTNAME` | Optional production hostname check, for example `techpro99.com`. |

Start with the values in `.env.example`. `REPAIR_REQUEST_MODE=mock` produces a `WEB-MOCK-...` reference and does not call any CRM. Production mode requires a valid HTTPS CRM endpoint, API key, and a server-validated Turnstile token.

## Stable localhost connector

The connector in `scripts/crm-connector.mjs` binds to localhost only. The HTTPS tunnel provides the public TLS endpoint; do not expose the connector port directly through the router.

1. Copy `.crm-connector.example.json` to `.crm-connector.local.json`. The local file is ignored by Git.
2. Set `crmAppRoot` to the absolute directory containing the English CRM project.
3. Set the CRM's current port and request path:

```powershell
node scripts/set-crm-port.mjs 3000 /api/repair-requests
```

4. Set `CRM_CONNECTOR_API_KEY` locally to the exact same long random value stored as `REPAIR_REQUEST_API_KEY` in Vercel.
5. Start the connector on its permanent local port:

```powershell
node --env-file-if-exists=.env.local scripts/crm-connector.mjs
```

6. Configure the named HTTPS tunnel once so its stable hostname routes to `http://127.0.0.1:4399`. Set Vercel's `REPAIR_REQUEST_API_URL` to that hostname plus `/repair-requests`.

For the shop computer, keep the **TecPro99 CRM Connector** shortcut in the Windows Startup folder. It runs `scripts/start-production-connector.vbs`, which starts one hidden supervisor. The supervisor checks every 15 seconds and restarts the CRM, connector, or Cloudflare tunnel if one of those processes exits. Its event log is `%LOCALAPPDATA%\TecPro99\logs\stack-supervisor.log`.

`GET http://127.0.0.1:4399/health` is an end-to-end readiness check. It returns `200` only when the connector can reach the CRM's `/health/ready` endpoint and the CRM can reach its database; otherwise it returns `503`.

When the CRM port changes later, run only this command with the new number:

```powershell
node scripts/set-crm-port.mjs NEW_PORT
```

The connector authenticates incoming requests with `X-API-Key`, accepts only the repair-request route, limits request size and request frequency, validates the normalized payload again, and preserves idempotency keys. `CRM_LOCAL_API_KEY` is optional and is forwarded only to a CRM that has its own local API authentication.

## CRM contract

The server forwards this JSON payload to `REPAIR_REQUEST_API_URL`:

```json
{
  "source": "TecPro99 Website",
  "customerName": "Customer Name",
  "phoneNumber": "7736287132",
  "email": "customer@example.com",
  "deviceType": "Phone",
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "problemDescription": "Broken screen",
  "preferredContactMethod": "Text Message",
  "pageUrl": "Page where the request was submitted",
  "submittedAt": "UTC timestamp"
}
```

The server normalizes US phone numbers to ten digits and replaces the browser timestamp with its own UTC timestamp. It sends `Idempotency-Key` to the CRM for retry safety. The CRM should return JSON containing `referenceNumber`; `reference` or `id` also work.

## Safeguards

The browser enforces a 10-minute cooldown after a successful request without storing customer details. The function allows up to three validated attempts per network every 30 minutes and up to two successful requests per normalized phone number every hour. It also rejects bodies larger than 16 KB, validates and sanitizes all fields, blocks cross-origin browser posts, traps honeypot submissions, preserves idempotent retries, and validates Turnstile tokens server-side.

The built-in limits are maintained per active function instance. For production protection across every Vercel instance, also enable matching Vercel Firewall rate limits or connect a shared rate-limit store. Turnstile must remain enabled in production.

Run the included server tests with a current Node.js runtime:

```powershell
node --test tests/crm-connector.test.mjs tests/repair-request.test.mjs
```
