# 1. Use lightweight Node.js
FROM node:20-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy ONLY the server's package files first
COPY server/package*.json ./

# 4. Install backend dependencies
RUN npm install

# 5. Copy the rest of the backend code from your server folder
COPY server/ .

# 6. Expose your backend port (change 1700 if your Express app uses a different port)
EXPOSE 1700

# 7. Start your server
CMD ["npm", "run", "dev"]