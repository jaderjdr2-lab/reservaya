# RESERVAYA

SaaS de reservas online para negocios de servicios en Colombia.

- **Producción:** https://reservaya-swart.vercel.app
- **Repo:** https://github.com/jaderjdr2-lab/reservaya
- **Stack:** Next.js 14, TypeScript, Tailwind, Prisma, Supabase

## Inicio rápido

```bash
cp .env.example .env   # configurar Supabase y DATABASE_URL
npm install
npx prisma db push
npm run dev
```

Abre http://localhost:3000

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo |
| `npm run build` | Build producción |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest |
| `npm run migrate:price` | Migrar precios legacy $40k → $150k |

## Documentación

- `docs/DIAGNOSTIC.md` — diagnóstico y salud del proyecto
- `docs/DEPLOYMENT.md` / `docs/PHASE2_DEPLOY.md` — deploy Vercel
- `docs/QA_CHECKLIST.md` — pruebas manuales
- `docs/WOMPI_PLAN.md` — integración pagos (fase siguiente)

## Variables de entorno

Ver `.env.example`. Nunca commitear `.env`.

## Licencia

Privado — RESERVAYA / Jhon.
