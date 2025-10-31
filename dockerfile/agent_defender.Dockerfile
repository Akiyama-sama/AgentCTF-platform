
# agent_defender/Dockerfile
FROM python:3.11-slim

RUN pip install uv
WORKDIR /app

COPY pyproject.toml* uv.lock* ./
RUN uv sync

COPY . .

# .env 文件将由 docker-compose 的 environment 变量动态创建
EXPOSE 17777
