
# AgentCTF-platform/Dockerfile
FROM node:20-alpine

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件并安装
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i

# 复制所有项目文件
COPY . .

# 复制 .env.example, 实际的 API 密钥将由 docker-compose 注入
RUN cp .env.example .env

EXPOSE 5173
