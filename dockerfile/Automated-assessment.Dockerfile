# Automated-assessment/Dockerfile
FROM python:3.11-slim
RUN pip install uv
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
RUN cp config.example.env .env
EXPOSE 8002
