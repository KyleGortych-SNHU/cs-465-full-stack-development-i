# Small secure base image
FROM node:18-slim

# App directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY --chown=node:node package.json package-lock.json ./

# Non-root user
USER node

# Install dependencies cleanly
RUN npm ci --omit=dev

# Copy app source
COPY --chown=node:node . .

# Production mode
ENV NODE_ENV=production

# App listens on 3000
EXPOSE 3000

# Start app
CMD ["node", "./bin/www"]
