
# agent_attacker/Dockerfile
FROM python:3.12-slim

RUN pip install uv
WORKDIR /app

COPY pyproject.toml* uv.lock* ./
RUN uv sync

COPY . .

# 复制 .env.development
RUN cp .env.development .env

EXPOSE 18888
