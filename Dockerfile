# ===== Build Frontend =====
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ===== Build Backend =====
FROM python:3.11-slim

WORKDIR /app

# Copy backend code
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Copy built frontend into backend's static folder
COPY --from=frontend-builder /frontend/build /app/static

EXPOSE 8099

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8099"]
