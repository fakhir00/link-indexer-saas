FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# System deps for spaCy, lxml, psycopg2
RUN apt-get update && apt-get install -y \
    gcc g++ curl libpq-dev libxml2-dev libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

COPY . .
# Copy built dashboard from the Node builder
COPY --from=frontend-builder /app/dist ./dashboard/dist

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
