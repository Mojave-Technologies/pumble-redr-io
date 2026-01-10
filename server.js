const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Configuration
const PUMBLE_SIGNING_SECRET = process.env.PUMBLE_SIGNING_SECRET;
const URL_SHORTENER_API = process.env.URL_SHORTENER_API;
const URL_SHORTENER_API_KEY = process.env.URL_SHORTENER_API_KEY;

// Verify Pumble request signature
function verifyPumbleSignature(req, res, next) {
    const timestamp = req.headers['x-pumble-request-timestamp'];
    const signature = req.headers['x-pumble-signature'];
    
    if (!timestamp || !signature) {
        return res.status(401).json({ error: 'Missing signature headers' });
    }

    // Check timestamp to prevent replay attacks (5 minutes tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestamp) > 300) {
        return res.status(401).json({ error: 'Request timestamp too old' });
    }

    // Verify signature
    const body = JSON.stringify(req.body);
    const signatureBaseString = `v0:${timestamp}:${body}`;
    const mySignature = 'v0=' + crypto
        .createHmac('sha256', PUMBLE_SIGNING_SECRET)
        .update(signatureBaseString)
        .digest('hex');

    if (mySignature !== signature) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
}

// URL shortening function
async function shortenUrl(longUrl) {
    try {
        // Example using a generic URL shortener API
        // Replace with your actual API endpoint
        const response = await axios.post(URL_SHORTENER_API, {
            url: longUrl
        }, {
            headers: {
                'Authorization': `Bearer ${URL_SHORTENER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.shortUrl || response.data.short_url;
    } catch (error) {
        console.error('URL shortening error:', error);
        throw new Error('Failed to shorten URL');
    }
}

// Slash command endpoint
app.post('/slash/shorten', verifyPumbleSignature, async (req, res) => {
    const { text, user_name, response_url } = req.body;

    // Immediate acknowledgment
    res.status(200).json({
        response_type: 'ephemeral',
        text: 'Shortening your URL... ⏳'
    });

    // Process asynchronously
    try {
        if (!text || !text.trim()) {
            await sendDelayedResponse(response_url, {
                response_type: 'ephemeral',
                text: '❌ Please provide a URL to shorten. Usage: `/shorten https://example.com`'
            });
            return;
        }

        const urlToShorten = text.trim();
        
        // Basic URL validation
        if (!isValidUrl(urlToShorten)) {
            await sendDelayedResponse(response_url, {
                response_type: 'ephemeral',
                text: '❌ Invalid URL format. Please provide a valid URL starting with http:// or https://'
            });
            return;
        }

        // Shorten the URL
        const shortUrl = await shortenUrl(urlToShorten);

        // Send success response
        await sendDelayedResponse(response_url, {
            response_type: 'in_channel',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `✅ URL shortened by @${user_name}`
                    }
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Original:*\n${urlToShorten}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Shortened:*\n${shortUrl}`
                        }
                    ]
                }
            ]
        });

    } catch (error) {
        console.error('Error processing slash command:', error);
        await sendDelayedResponse(response_url, {
            response_type: 'ephemeral',
            text: '❌ An error occurred while shortening the URL. Please try again.'
        });
    }
});

// Send delayed response to Pumble
async function sendDelayedResponse(responseUrl, payload) {
    try {
        await axios.post(responseUrl, payload);
    } catch (error) {
        console.error('Error sending delayed response:', error);
    }
}

// URL validation helper
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Pumble URL Shortener app listening on port ${PORT}`);
});
