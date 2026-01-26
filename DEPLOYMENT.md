# Deployment Guide — Oracle Cloud

Step-by-step instructions for deploying Pumble REDR bot on Oracle Cloud Infrastructure.

## Prerequisites

- Oracle Cloud instance (Ubuntu 22.04 or Oracle Linux 8/9 recommended)
- External IP assigned to the instance
- SSH access to the instance
- Pumble App credentials (App ID, Client Secret, Signing Secret, App Key)
- REDR API key

---

## 1. Connect to Instance

```bash
ssh opc@<your-instance-ip>
# or for Ubuntu:
ssh ubuntu@<your-instance-ip>
```

---

## 2. Install Docker

### For Oracle Linux 8/9:

```bash
# Install Docker
sudo dnf install -y dnf-utils
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (logout/login required after)
sudo usermod -aG docker $USER
```

### For Ubuntu 22.04:

```bash
# Install Docker
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
```

**Important:** Log out and log back in after adding user to docker group.

### Verify Docker installation:

```bash
docker --version
docker compose version
```

---

## 3. Open Firewall Port

### Oracle Cloud Console (required):

1. Go to **Networking → Virtual Cloud Networks**
2. Select your VCN → **Security Lists**
3. Add **Ingress Rule**:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `8183`
   - Protocol: TCP

### Instance firewall (Oracle Linux):

```bash
sudo firewall-cmd --permanent --add-port=8183/tcp
sudo firewall-cmd --reload
```

### Instance firewall (Ubuntu):

```bash
sudo ufw allow 8183/tcp
```

---

## 4. Clone Repository

```bash
cd ~
git clone <repository-url> pumble-redr-io
cd pumble-redr-io
```

---

## 5. Configure Environment

```bash
cp .env.example .env
nano .env  # or vim .env
```

Fill in your credentials (see `.env.example` for all options):

```env
# Pumble App Credentials
# Get these from .pumbleapprc file (created during local dev setup)
# Or from Pumble Developer Portal
PUMBLE_APP_ID=your_app_id
PUMBLE_APP_CLIENT_SECRET=your_client_secret
PUMBLE_APP_SIGNING_SECRET=your_signing_secret
PUMBLE_APP_KEY=your_app_key

# IMPORTANT: Your server's external URL (where Pumble sends webhooks)
ADDON_HOST=http://<your-instance-ip>:8183

# REDR API
REDR_API_URL=https://redr.io/api/links
REDR_API_KEY=your_redr_api_key
REDR_DOMAIN_ID=your_domain_id
REDR_FOLDER_NAME=pumble

# Server port
PUMBLE_ADDON_PORT=8183
```

**Important:** 
- `ADDON_HOST` must match your server's external IP — this is the URL Pumble will use to send webhooks
- `PUMBLE_ADDON_PORT` is the port the app listens on (default: 5000)

---

## 6. Update Pumble App Manifest URL

In **Pumble Developer Portal**, update your app's manifest URL to:

```
http://<your-instance-ip>:8183/manifest
```

---

## 7. Build and Run

```bash
# Create empty tokens file (for OAuth token persistence)
touch tokens.json

# Build the image
docker compose -f docker-compose.prod.yml build

# Start the container (detached)
docker compose -f docker-compose.prod.yml up -d
```

---

## 8. Verify Deployment

### Check container is running:

```bash
docker compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                IMAGE               STATUS
pumble-redr-app     pumble-redr-io      Up 2 minutes
```

### Check logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Test manifest endpoint:

```bash
curl http://localhost:8183/manifest
```

Or from your machine:
```bash
curl http://<your-instance-ip>:8183/manifest
```

---

## 9. Register App in Pumble (Important!)

Since this is a new deployment with a different URL than development:

1. Go to **Pumble Developer Portal**: https://developer.marketplace.cake.com
2. Select your app
3. Update the **Manifest URL** to: `http://<your-instance-ip>:8183/manifest`
4. Click **Save**
5. Go to your Pumble workspace
6. **Reinstall/Re-authorize** the app

This step is **required** — Pumble needs to know the new webhook URL to send events to your production server.

The app will create a new `tokens.json` file on first authorization.

---

## Maintenance Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Update and redeploy
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Container won't start

```bash
docker compose -f docker-compose.prod.yml logs
```

Check for missing environment variables or invalid credentials.

### Can't reach manifest URL

1. Verify security list in Oracle Cloud Console has port 8183 open
2. Check instance firewall: `sudo firewall-cmd --list-ports`
3. Verify container is running: `docker compose -f docker-compose.prod.yml ps`

### Bot not responding in Pumble

1. Check manifest URL is correct in Pumble Developer Portal
2. Verify app is authorized/installed
3. Check container logs for errors: `docker compose -f docker-compose.prod.yml logs -f`

---

## Security Notes

- For production, consider adding HTTPS via reverse proxy (nginx + Let's Encrypt)
- Keep `.env` file secure and never commit to git
- Regularly update Docker images: `docker compose pull && docker compose up -d`
