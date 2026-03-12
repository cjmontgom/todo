# Todo App

A minimal, full-stack todo application built with React + Vite (frontend) and Fastify + PostgreSQL (backend).

## Project Structure

```
todo/
├── frontend/   → React + TypeScript + Tailwind CSS v4 (Vite)
└── backend/    → Fastify + TypeScript + pg (raw SQL)
```

## Prerequisites

- Node.js 20+
- PostgreSQL

## Getting Started

### Database

```bash
# Create the database
createdb todo

# Run the schema
psql -d todo -f backend/schema.sql
```

### Backend

```bash
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm run dev             # http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```
