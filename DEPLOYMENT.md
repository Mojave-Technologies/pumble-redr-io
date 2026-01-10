# Deployment Guide

This guide covers deploying your Pumble URL Shortener to various platforms.

## Table of Contents
- [Railway](#railway)
- [Render](#render)
- [Heroku](#heroku)
- [AWS (EC2)](#aws-ec2)
- [Docker](#docker)
- [Vercel](#vercel)

---

## Railway

Railway is recommended for quick deployment with minimal configuration.

### Steps:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   railway init
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set PUMBLE_SIGNING_SECRET=your_secret
   railway variables set URL_SHORTENER_API=your_api_url
   railway variables set URL_SHORTENER_API_KEY=your_api_key
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get Domain:**
   ```bash
   railway domain
   ```

Update your Pumble app's Request URL with the Railway domain.

---

## Render

### Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: pumble-url-shortener
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables:**
   - Go to "Environment" tab
   - Add:
     - `PUMBLE_SIGNING_SECRET`
     - `URL_SHORTENER_API`
     - `URL_SHORTENER_API_KEY`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete

5. **Get URL:**
   - Copy your Render URL (e.g., `https://pumble-url-shortener.onrender.com`)
   - Update Pumble app's Request URL

---

## Heroku

### Steps:

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create App:**
   ```bash
   heroku create pumble-url-shortener
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set PUMBLE_SIGNING_SECRET=your_secret
   heroku config:set URL_SHORTENER_API=your_api_url
   heroku config:set URL_SHORTENER_API_KEY=your_api_key
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Open App:**
   ```bash
   heroku open
   ```

7. **View Logs:**
   ```bash
   heroku logs --tail
   ```

---

## AWS EC2

### Steps:

1. **Launch EC2 Instance:**
   - Amazon Linux 2 or Ubuntu 22.04
   - t2.micro (free tier eligible)
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect to Instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

4. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone Repository:**
   ```bash
   git clone your-repo-url
   cd pumble-url-shortener
   ```

6. **Install Dependencies:**
   ```bash
   npm install
   ```

7. **Create .env File:**
   ```bash
   nano .env
   # Add your environment variables
   ```

8. **Start with PM2:**
   ```bash
   pm2 start server.js --name pumble-shortener
   pm2 startup
   pm2 save
   ```

9. **Setup Nginx (Optional):**
   ```bash
   sudo yum install -y nginx
   sudo nano /etc/nginx/conf.d/pumble.conf
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Start Nginx:**
    ```bash
    sudo systemctl start nginx
    sudo systemctl enable nginx
    ```

---

## Docker

### Local Development:

```bash
docker-compose up
```

### Production Deployment:

1. **Build Image:**
   ```bash
   docker build -t pumble-url-shortener .
   ```

2. **Run Container:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e PUMBLE_SIGNING_SECRET=your_secret \
     -e URL_SHORTENER_API=your_api_url \
     -e URL_SHORTENER_API_KEY=your_api_key \
     --name pumble-shortener \
     pumble-url-shortener
   ```

3. **Push to Registry (Optional):**
   ```bash
   docker tag pumble-url-shortener your-registry/pumble-url-shortener
   docker push your-registry/pumble-url-shortener
   ```

### Docker Swarm:

```bash
docker stack deploy -c docker-compose.yml pumble
```

---

## Vercel

Note: Vercel is designed for serverless functions, so requires modification.

### Steps:

1. **Create `api/shorten.js`:**
   ```javascript
   const crypto = require('crypto');
   const axios = require('axios');

   module.exports = async (req, res) => {
       if (req.method !== 'POST') {
           return res.status(405).json({ error: 'Method not allowed' });
       }

       // Copy your slash command logic here
       // Adjust for serverless environment
   };
   ```

2. **Create `vercel.json`:**
   ```json
   {
       "version": 2,
       "builds": [
           {
               "src": "api/**/*.js",
               "use": "@vercel/node"
           }
       ],
       "routes": [
           {
               "src": "/slash/shorten",
               "dest": "/api/shorten.js"
           }
       ]
   }
   ```

3. **Deploy:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Copy your deployment URL
- [ ] Update Pumble app's Request URL in Developer Portal
- [ ] Test the `/shorten` command in Pumble
- [ ] Check application logs for errors
- [ ] Verify signature verification is working
- [ ] Test with various URLs
- [ ] Set up monitoring/alerts
- [ ] Configure SSL/HTTPS (most platforms do this automatically)

---

## Monitoring & Logs

### Railway:
```bash
railway logs
```

### Render:
- View logs in dashboard under "Logs" tab

### Heroku:
```bash
heroku logs --tail
```

### PM2 (EC2):
```bash
pm2 logs pumble-shortener
pm2 monit
```

### Docker:
```bash
docker logs -f pumble-shortener
```

---

## Troubleshooting

### Common Issues:

1. **Port Already in Use:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 PID
   ```

2. **Environment Variables Not Loading:**
   - Verify `.env` file exists
   - Check file permissions
   - Restart application

3. **Signature Verification Fails:**
   - Check signing secret matches Pumble
   - Verify timestamp is within 5 minutes

4. **External Access Issues:**
   - Check firewall rules
   - Verify security group settings (AWS)
   - Ensure correct port is exposed

---

## Scaling Considerations

For high-traffic deployments:

1. **Use Load Balancer:**
   - AWS ALB
   - Nginx upstream
   - Railway auto-scaling

2. **Enable Caching:**
   - Redis for frequently shortened URLs
   - CDN for static assets

3. **Database for Persistence:**
   - MongoDB for URL mapping
   - PostgreSQL for analytics

4. **Rate Limiting:**
   - Implement per-user rate limits
   - Use Redis for distributed rate limiting

---

## Security Hardening

1. **HTTPS Only:**
   - Use Let's Encrypt for SSL
   - Enforce HTTPS redirects

2. **Environment Security:**
   - Never commit `.env` to git
   - Use secret management services
   - Rotate API keys regularly

3. **Request Validation:**
   - Already implemented signature verification
   - Add IP whitelisting if needed
   - Implement rate limiting

---

Need help? Contact Mojave Technologies support.
