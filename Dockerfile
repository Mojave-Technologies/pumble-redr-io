# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Copy private config files
COPY .pumbleapprc .pumbleapprc
COPY .pumblerc /root/.pumblerc
COPY .env .env
COPY tokens.json tokens.json
COPY .pumble-app-manifest.json .pumble-app-manifest.json

# Build TypeScript
RUN npm run build

# Default port
EXPOSE 8183

# Use pumble-cli
CMD ["sh", "-c", "npx pumble-cli --program ./dist/main.js --port 8183 --host ${TUNNEL_URL:-http://localhost:8183}"]
