# Multi-stage production build recipe for Node/Vite Applet
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions and custom npm configurations
COPY package*.json ./
COPY .npmrc ./

# Install all dependencies (including devDependencies required for the build phase)
RUN npm ci

# Copy full application source files
COPY . .

# Build step compiling the React SPA into static assets and the server into a single file
RUN npm run build

# Target runner stage to optimize deployment image size and isolation
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built package definitions and artifacts from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/dist ./dist

# Install only node packages flagged under "dependencies"
RUN npm ci --only=production

# Expose server ingress port corresponding to reverse proxy standard
EXPOSE 3000

# Declare environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Launch server
CMD ["npm", "start"]
