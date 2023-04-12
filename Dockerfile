# Build Environment: Node + Playwright
FROM node:18
FROM mcr.microsoft.com/playwright:focal

# Env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Export port 3000 for Node
EXPOSE 3000

# Copy all app files into Docker Work directory
COPY package*.json /app/
COPY *.js /app/
COPY .env /app/
COPY db/ /app/db/

# Install Deps
RUN npm install

# Build TS into JS to run via Node
RUN npm run start

# Run Node index.js file