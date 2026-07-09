FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Pre-install Ollama CLI inside the workspace container so you have it ready
RUN curl -fsSL https://ollama.com/install.sh | sh