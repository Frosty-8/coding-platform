# Use lightweight Node image
FROM node:18-slim

# Install Python (minimal required)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy all project files
COPY . .

# Create temp directory (for code execution)
RUN mkdir -p temp

# Set environment
ENV NODE_ENV=production

# Expose port (Render uses this)
EXPOSE 5000

# Start your backend
CMD ["npm", "start"]