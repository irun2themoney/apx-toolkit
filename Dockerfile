# Use Apify's Playwright base image (includes Node.js and Playwright dependencies)
FROM apify/actor-node-playwright-chrome:20

# Set working directory
WORKDIR /usr/src/app

# Ensure the working directory is owned by the myuser (Apify base image user)
USER root
RUN chown -R myuser:myuser /usr/src/app
USER myuser

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install --include=dev --loglevel=error

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["npm", "start"]

