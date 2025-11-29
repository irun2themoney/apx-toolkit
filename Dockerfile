# Use Apify's Playwright base image (includes Node.js and Playwright dependencies)
FROM apify/actor-node-playwright-chrome:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (Apify base images run as non-root user, so no permission issues)
RUN npm install --loglevel=error

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["npm", "start"]

