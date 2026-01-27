# Pumble REDR URL Shortener

Pumble app for shortening URLs via [REDR.io](https://rdr.im) service.

## Features

- `/shorturl <url>` — slash command to shorten URLs
- **Global shortcut** — open modal from anywhere
- **Message shortcut** — shorten URL from selected message
- **Auto-shorten** — automatically shortens URLs in messages

## Configuration

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

### Required

| Variable | Description |
|----------|-------------|
| `REDR_API_URL` | REDR API endpoint (e.g., `https://rdr.im/api/urls`) |
| `REDR_API_KEY` | Your REDR API key |
| `REDR_DOMAIN_ID` | Domain ID for short URLs |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `REDR_FOLDER_ID` | — | If set, skips folder lookup/creation |
| `REDR_FOLDER_NAME` | `pumble-redr` | Folder name (used when `REDR_FOLDER_ID` not set) |
| `REDR_HTTP_TIMEOUT_MS` | `25000` | HTTP request timeout in ms |

## Local Development

### Option 1: Docker (Recommended)

Single command starts everything — tunnel, app, and shows manifest URL.

#### Prerequisites

- Docker & Docker Compose
- Pumble CLI authenticated (run `npx pumble-cli login` once)

#### First-time setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your REDR credentials
   ```

2. **Login to Pumble CLI** (creates `.pumbleapprc` and `~/.pumblerc`):
   ```bash
   npx pumble-cli login
   ```

3. **Copy `.pumblerc` to project folder** (Docker needs it):
   ```bash
   cp ~/.pumblerc .pumblerc
   ```

4. **Create tokens file** (if not exists):
   ```bash
   echo '{}' > tokens.json
   ```

#### Run

```bash
./dev.sh
```

Script will:
1. Start Cloudflare tunnel
2. Wait for tunnel URL
3. Display manifest URL
4. Start app with correct tunnel URL

Output example:
```
===========================================
  TUNNEL READY
===========================================

  Tunnel URL:   https://xxx-yyy-zzz.trycloudflare.com
  Manifest URL: https://xxx-yyy-zzz.trycloudflare.com/manifest

  Go to https://developer.marketplace.cake.com
     and set manifest URL to:

     https://xxx-yyy-zzz.trycloudflare.com/manifest

===========================================
```

#### Useful commands

```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild after code changes
./dev.sh
```

---

### Option 2: Manual (without Docker)

#### Prerequisites

- Node.js 18+
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed

#### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Cloudflare tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:8183
   ```
   This outputs a URL like `https://leg-fill-winston-jul.trycloudflare.com`.

3. **Start the app** (in another terminal):
   ```bash
   npm run dev -- --port 8183 --host https://YOUR-TUNNEL-URL.trycloudflare.com
   ```

4. **Register in Pumble Developer Console:**
   - Go to [developer.marketplace.cake.com](https://developer.marketplace.cake.com/)
   - Create/edit app
   - Set manifest URL: `https://YOUR-TUNNEL-URL.trycloudflare.com/manifest`
   - Install to workspace

## Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/env.ts          # Environment configuration
├── api/
│   ├── helpers.ts         # Error types, utilities
│   ├── httpClient.ts      # HTTP client for REDR
│   └── redr/redrApi.ts    # REDR API calls
├── cache/
│   ├── folderCache.ts     # Folder cache with lazy init
│   └── domainCache.ts     # Domain cache
├── redr/
│   ├── folderService.ts   # URL builders
│   ├── urlService.ts      # URL shortening
│   └── shortenFlow.ts     # Workflow orchestrator
├── pumble/
│   ├── deliver.ts         # Message delivery
│   ├── modal.ts           # Modal builder
│   └── stateReaders.ts    # Modal state readers
├── utils/url.ts           # URL validation
├── app.ts                 # Pumble app handlers
└── main.ts                # Entry point
```

## License

MIT
