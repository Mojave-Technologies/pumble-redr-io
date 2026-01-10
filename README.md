# Pumble URL Shortener Integration

A Node.js application that integrates with Pumble's slash commands to provide URL shortening functionality directly within your Pumble workspace.

## Features

- ✅ Slash command integration (`/shorten`)
- ✅ Signature verification for security
- ✅ URL validation
- ✅ Async processing with immediate acknowledgment
- ✅ Rich message formatting using Pumble's Block Kit
- ✅ Error handling and user feedback
- ✅ Replay attack prevention

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Pumble workspace with admin access
- Access to a URL shortening API

## Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `PUMBLE_SIGNING_SECRET`: Get from Pumble Developer Portal
   - `URL_SHORTENER_API`: Your URL shortening service endpoint
   - `URL_SHORTENER_API_KEY`: API key for your shortening service

## Pumble App Configuration

1. **Create a Pumble App:**
   - Go to [Pumble Marketplace Developer Portal](https://marketplace.cake.com)
   - Create a new app
   - Give it a name and description

2. **Configure Slash Command:**
   - Navigate to "Slash Commands" section
   - Click "Add Slash Command"
   - Command: `/shorten`
   - Request URL: `https://your-domain.com/slash/shorten`
   - Short Description: "Shorten a URL"
   - Usage Hint: `[url]`

3. **Get Signing Secret:**
   - Go to "Basic Information"
   - Copy the "Signing Secret"
   - Add it to your `.env` file as `PUMBLE_SIGNING_SECRET`

4. **Install App to Workspace:**
   - Click "Install to Workspace"
   - Authorize the required permissions

## Deployment

### Local Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

For local testing with Pumble, use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
```

Update your Pumble app's Request URL with the ngrok URL.

### Production Deployment

#### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Render
1. Connect your GitHub repository
2. Create a new Web Service
3. Set environment variables in Render dashboard
4. Deploy

#### Heroku
```bash
heroku create pumble-url-shortener
heroku config:set PUMBLE_SIGNING_SECRET=your_secret
heroku config:set URL_SHORTENER_API=your_api_url
heroku config:set URL_SHORTENER_API_KEY=your_api_key
git push heroku main
```

#### Docker
```bash
docker build -t pumble-url-shortener .
docker run -p 3000:3000 --env-file .env pumble-url-shortener
```

## Usage

In your Pumble workspace, use the slash command:

```
/shorten https://example.com/very/long/url/that/needs/shortening
```

The bot will respond with:
- An immediate acknowledgment message
- A formatted response showing both the original and shortened URLs

## API Integration

### Supported URL Shorteners

The app can work with any URL shortening service. Here are examples:

#### Bitly
```javascript
// In shortenUrl function
const response = await axios.post('https://api-ssl.bitly.com/v4/shorten', {
    long_url: longUrl
}, {
    headers: {
        'Authorization': `Bearer ${URL_SHORTENER_API_KEY}`,
        'Content-Type': 'application/json'
    }
});
return response.data.link;
```

#### TinyURL
```javascript
const response = await axios.post('https://api.tinyurl.com/create', {
    url: longUrl
}, {
    headers: {
        'Authorization': `Bearer ${URL_SHORTENER_API_KEY}`,
        'Content-Type': 'application/json'
    }
});
return response.data.data.tiny_url;
```

#### Custom/Internal API
Modify the `shortenUrl` function in `server.js` to match your API's format.

## Security

- **Signature Verification**: All requests are verified using HMAC SHA256
- **Timestamp Validation**: Prevents replay attacks (5-minute window)
- **URL Validation**: Ensures only valid HTTP/HTTPS URLs are processed
- **Environment Variables**: Sensitive data stored securely

## Error Handling

The app handles various error scenarios:
- Missing or invalid URLs
- API failures
- Invalid signatures
- Expired timestamps
- Network errors

## Project Structure

```
pumble-url-shortener/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Customization

### Change Response Format

Edit the response blocks in `server.js`:

```javascript
await sendDelayedResponse(response_url, {
    response_type: 'in_channel',
    blocks: [
        // Customize your blocks here
    ]
});
```

### Add Analytics

Track URL shortening events:

```javascript
// After successful shortening
await logAnalytics({
    user: user_name,
    originalUrl: urlToShorten,
    shortUrl: shortUrl,
    timestamp: new Date()
});
```

### Add QR Code Generation

Install qrcode package and modify the response to include QR codes.

## Troubleshooting

### Signature Verification Fails
- Ensure `PUMBLE_SIGNING_SECRET` matches the value in Pumble Developer Portal
- Check that your server's clock is synchronized

### URL Shortening Fails
- Verify `URL_SHORTENER_API` and `URL_SHORTENER_API_KEY` are correct
- Check API service status
- Review API response format matches your parsing logic

### Command Not Responding
- Check server logs for errors
- Verify the Request URL in Pumble app settings
- Ensure your server is publicly accessible

## Support

For issues related to:
- **This integration**: Check server logs and verify configuration
- **Pumble platform**: Visit [Pumble Support](https://support.cake.com)
- **URL shortening service**: Contact your API provider

## License

MIT License - feel free to modify and use for your needs.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Changelog

### v1.0.0 (2026-01-10)
- Initial release
- Slash command integration
- URL shortening functionality
- Security features (signature verification, timestamp validation)
- Error handling and user feedback

---

Built by Mojave Technologies
