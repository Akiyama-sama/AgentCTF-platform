# compose-agent/Dockerfile
FROM python:3.11-slim
RUN pip install uv
RUN apt-get update && apt-get install -y git && \
	rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY pyproject.toml* uv.lock* ./
RUN uv sync
COPY . .
RUN cp .env.example .env
RUN git clone --depth 1 https://github.com/vulhub/vulhub.git data/vulhub
EXPOSE 14444
