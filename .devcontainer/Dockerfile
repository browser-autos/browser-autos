# Use Playwright image which includes Chromium and all dependencies
FROM mcr.microsoft.com/playwright:v1.56.0-jammy

# Install Node.js 20
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    redis-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create node user with proper permissions
RUN groupadd -g 1000 node && \
    useradd -u 1000 -g 1000 -s /bin/bash -m node && \
    echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set working directory
WORKDIR /workspace

# Switch to node user
USER node

# Install global npm packages
RUN npm install -g tsx typescript

ENV SHELL=/bin/bash
