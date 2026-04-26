# ARM64-compatible (Raspberry Pi 5)
FROM python:3.12-slim

WORKDIR /app

COPY api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/
RUN mkdir -p /app/data

ENV DATABASE_URL=sqlite:////app/data/eventique.db
ENV PYTHONUNBUFFERED=1

EXPOSE 8700

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8700", "--workers", "2"]
