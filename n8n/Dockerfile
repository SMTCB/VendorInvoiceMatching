# Use a standard Node.js Debian image (Reliable & has package manager)
FROM node:20-bookworm

# Install system dependencies (Tesseract OCR & Ghostscript)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    graphicsmagick \
    tesseract-ocr \
    tesseract-ocr-eng \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install n8n globally (Explicitly using the official npm package)
RUN npm install n8n@latest -g

# Set up the execution user and directory
# We use /home/node/.n8n for configuration to match official n8n behavior
ENV N8N_PORT=5678
ENV NODE_ENV=production
WORKDIR /data

# Expose the default port
EXPOSE 5678

# Start n8n
CMD ["n8n", "start"]




