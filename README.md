# Creative

Sci-fi journal app built with Next.js, Prisma, and Postgres.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create or update `.env` and set `DATABASE_URL`.
   Also set `APP_SECRETS_KEY` for server-side encryption.

   `APP_SECRETS_KEY` must be 32 bytes (raw or base64-decoded), for example:

```bash
openssl rand -base64 32
```

3. Generate the Prisma client and apply migrations.

```bash
npm run db:generate
npx prisma migrate deploy
```

4. Optional for local development: seed sample logs.

```bash
npm run db:seed
```

5. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000/logs`.

Then sign in and open `http://localhost:3000/ask` to save your own Groq API key.
Each user key is encrypted at rest and used only for that user when asking questions.

## Current Scope

- `/logs` supports listing and creating journal entries against Postgres.
- Each entry stores a text body, one controlled tag, and timestamps.
- `/ask` supports one-shot questions over your logs and returns an answer with citations.

## Verification

Useful checks while developing:

```bash
npm run lint
npx tsc --noEmit
```

If the Prisma schema changes, rerun:

```bash
npm run db:generate
```
