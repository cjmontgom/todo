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
- PostgreSQL 15+ (via Homebrew on macOS, or your preferred installation method)

## Getting Started

### 1. Install PostgreSQL (macOS)

If you don't already have PostgreSQL installed:

```bash
brew install postgresql@17
```

Start the service:

```bash
brew services start postgresql@17
```

Verify it's running:

```bash
psql -l
```

You should see a list of default databases. If you get a "connection refused" error, PostgreSQL isn't running yet.

### 2. Create the Database

```bash
# Create the todo database
createdb todo

# Run the schema to create the tasks table
psql -d todo -f backend/schema.sql
```

To verify the table was created:

```bash
psql -d todo -c '\dt'
```

You should see a `tasks` table listed.

### 3. Backend

```bash
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm run dev             # http://localhost:3001
```

The default `DATABASE_URL` is `postgresql://localhost:5432/todo`, which works for a standard local Homebrew PostgreSQL setup with no password.

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npx vitest run
```
