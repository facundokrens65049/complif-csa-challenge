# CSA Challenge · Complif

**Facundo Krens**

Case-study site for the Customer Success Analyst challenge.

Stack: **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Postgres + Lightweight Charts**. Built to deploy on Vercel. ES/EN switchable. Contact lives in `config/contact.properties`.

The MEP chart reads `mep_implicito` (live view over `precios`) from Postgres. Without env vars or seed data, the SQL section shows an error (no hardcoded series).

## Local

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Schema lives in [`database/schema.sql`](database/schema.sql). Apply it with `psql`.

1. Create a Postgres project (15+).
2. Set `POSTGRES_URL` in `.env` (URI from the dashboard **Connect** dialog, not the HTTP API URL). Use `sslmode=require` if the host enforces TLS.
3. Apply schema and load ticks from the [db-fiddle](https://www.db-fiddle.com/f/ftyc8MFKVfYEFL6RRt7Vxx/0):

```bash
npm run db:schema
npm run db:seed
```

4. Copy the HTTP project URL and anon key into `.env` as `NEXT_PUBLIC_DATABASE_URL` and `NEXT_PUBLIC_DATABASE_ANON_KEY`.

Index: `precios (datetime, moneda, id)` is the access path. Same-instant ticks stay distinct (no average). The series is not materialized: query the live view with WHERE and LIMIT.

## Vercel

1. Import the repo.
2. Set `NEXT_PUBLIC_DATABASE_URL` and `NEXT_PUBLIC_DATABASE_ANON_KEY` (Production + Preview).
3. Deploy.

Checklist:

- [ ] Postgres project created
- [ ] `npm run db:schema` and `npm run db:seed` applied
- [ ] Env vars set on Vercel
- [ ] Deploy OK and chart reads from the database
