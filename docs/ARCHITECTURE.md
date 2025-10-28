# AI Traveller Architecture

## Overview
AI Traveller is a full-stack JavaScript web application that helps users plan and manage trips with the assistance of AI. The platform consists of a React frontend for user interaction and an Express backend that orchestrates integrations with external services including Supabase (authentication and persistence), large language model providers (itinerary generation and budgeting), Gaode (Amap) for mapping, and speech APIs (iFlytek by default) for voice capture.

The entire stack runs with a single command in development using an npm workspace and is packaged into a Docker image for deployment.

## Core Modules

### Frontend (`frontend/`)
- **Tech stack**: Vite + React + React Router, Tailwind CSS, Zustand state management.
- **Authentication**: Custom email OTP flow built on Supabase Auth. Users request a six-digit code via email, enter it to complete signup/login, and may supply a username on first registration. A mock-token flow remains available for demo mode.
- **Voice inputs**: Uses the Web Speech API by default and can call the backend proxy for iFlytek once credentials are provided.
- **Maps**: Loads the Gaode JS SDK dynamically and renders travel routes and POI markers based on backend responses, auto-enriching itinerary items with coordinates when missing.
- **Pages**:
  - Authentication hub (login, registration, teaching-mode token login).
  - Trip dashboard with saved itineraries and expense summaries.
  - Trip planner wizard for defining destination, dates, budget, party, and preferences.
  - Trip details view with real-time assistant tips, maps, and expense tracking.
- **APIs consumed**: Auth session/token exchange, itinerary CRUD, expense CRUD, AI plan generation, AI budget estimation, voice-to-text proxy, map POI lookup.

### Backend (`backend/`)
- **Tech stack**: Node.js + Express + PostgreSQL (via Supabase client) + OpenAI SDK-compatible LLM driver.
- **Service layers**:
  - `authService` sends/validates Supabase email OTP codes, provisions usernames in `profiles`, exchanges tokens, and supports a mock fallback.
  - `itineraryService` persists itineraries/AI plans in Supabase tables with optional geo-enrichment.
  - `expenseService` records expenses per trip and syncs aggregates.
  - `aiService` abstracts LLM provider calls with structured prompts and fallbacks.
  - `speechService` proxies voice recognition requests to iFlytek REST API and normalizes results for frontend consumption.
  - `mapService` provides helper endpoints for frontend fallback queries (reverse geocode, POI search) using Gaode Web Service API.
- **API routes**:
-  - `POST /api/auth/otp/send` – request an OTP for login/signup.
-  - `POST /api/auth/otp/verify` – verify the email OTP and return a session token.
  - `POST /api/auth/token` – exchange Supabase access token for profile payload.
  - Authenticated routes for `/api/trips`, `/api/trips/:id/plan`, `/api/trips/:id/budget`, `/api/trips/:id/expenses`, `/api/maps/*`, `/api/speech/recognize`.
- **Storage schema** (Supabase Postgres):
  - `profiles` (id pk references `auth.users`, `username` unique, `email`).
  - `trips`, `itineraries`, `budgets`, `expenses` with row-level security tied to `auth.uid()`.

### Shared Type Definitions (`packages/common/`)
Shared DTOs, constants, and client utilities consumed by both frontend and backend. Published as an internal workspace package.

## Configuration
- Environment variables stored in `.env` (development) and `.env.production` (deployment build).
- Keys:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.
  - `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL`.
  - `IFLYTEK_APP_ID`, `IFLYTEK_API_SECRET`, `IFLYTEK_API_KEY`.
  - `AMAP_WEB_SERVICE_KEY` (backend).
  - `VITE_AMAP_JS_KEY`, `VITE_AMAP_JS_SECURITY_CODE` (frontend).
- The frontend reads public-safe keys prefixed with `VITE_`. All secrets are injected at runtime via Docker or `.env` mounted files.

## Deployment & Dev Workflow
- **Development**: `npm install` at repo root, then `npm run dev` to start backend and frontend concurrently with hot reload.
- **Docker**: Multi-stage build that installs dependencies, builds frontend assets, bundles backend, and serves via Node.js on port 8080.
- **GitHub Actions**: Workflow (planned) to lint, test, build Docker image, and push to Aliyun Container Registry.
- **PDF Submission**: A Node script generates `docs/submission.pdf` from the README and repository metadata via `md-to-pdf`.

## Future Enhancements
- Real-time collaboration via Supabase Realtime.
- Offline itinerary caching in browser IndexedDB.
- Mobile app shell (React Native) reusing backend APIs.
- Analytics dashboards for expense tracking and travel stats.
