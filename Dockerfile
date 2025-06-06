# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies only where needed
COPY package*.json ./
RUN npm install

# Copy all files and build the app
COPY . .
RUN npm run build

# Use a lightweight image for serving (distroless is optional for extra security)
FROM node:20-alpine

WORKDIR /app

# Only copy the build and needed files for serving
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port your app will run on
EXPOSE 9007

# Use Vite's preview server for production preview
CMD ["npm", "run", "preview", "--", "--port", "9007", "--host"]