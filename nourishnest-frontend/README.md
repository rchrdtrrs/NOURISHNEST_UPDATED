# NourishNest Frontend

Frontend application built with React, TypeScript, and Vite.

## Requirements

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.local.example .env.local
```

3. Set PayPal client ID in .env.local:

```env
VITE_PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
```

Important:

- The client ID must belong to the same PayPal sandbox app that owns the subscription plan IDs used by the backend.
- If client ID and plan IDs come from different apps, PayPal returns RESOURCE_NOT_FOUND / INVALID_RESOURCE_ID.

## Run

```bash
npm run dev -- --host localhost --port 5173 --strictPort
```

## Build

```bash
npm run build
```
