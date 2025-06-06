# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies only where needed
COPY package*.json ./
RUN npm install

# Copy all files and build the app
COPY . .
RUN npm run build

# Use a lightweight image for serving
FROM node:20-alpine

WORKDIR /app

# Only copy the build and needed files for serving
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port your app will run on
EXPOSE 9007

# Use Next.js start command for production
CMD ["npm", "run", "start", "--", "-p", "9007"]