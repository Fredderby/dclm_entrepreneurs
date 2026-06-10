# Step 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# ✅ SET CORRECT API URL DURING BUILD — NO MORE BAD GATEWAY
# This overrides whatever was in your local .env
ARG REACT_APP_API_URL=http://127.0.0.1:9000
ENV REACT_APP_API_URL=http://127.0.0.1:9000

# Copy source code
COPY . .

# Build with correct URL
RUN npm run build

# Step 2: Production Nginx
FROM nginx:alpine

# ✅ ADD CUSTOM NGINX CONFIG — THIS IS WHAT FIXES BAD GATEWAY
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]