# Setup Status ✅

## Completed Steps

✅ **Monorepo struktur oprettet** (Turborepo)
✅ **Root dependencies installeret** (npm install)
✅ **Backend dependencies installeret** (apps/backend)
✅ **Mobile dependencies installeret** (apps/mobile)
✅ **Database schema konfigureret** (Prisma)

## Næste Skridt

### 1. Installer Docker (Hvis ikke allerede installeret)

Docker blev ikke fundet på systemet. Download og installer:

**Windows:**
- Download Docker Desktop fra: https://www.docker.com/products/docker-desktop
- Installer og genstart computeren
- Start Docker Desktop

**Verificer installation:**
```bash
docker --version
docker compose version
```

### 2. Start Database

Når Docker er installeret:

```bash
docker compose up -d
```

Vent 10-15 sekunder, og verificer at databasen kører:

```bash
docker compose ps
```

### 3. Setup Prisma

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Backend Server

```bash
cd apps/backend
npm run dev
```

Backend kører nu på http://localhost:3000

Test med:
```bash
curl http://localhost:3000/health
```

### 5. Start Mobile App

I en ny terminal:

```bash
cd apps/mobile
npm run dev
```

Følg instruktionerne i terminalen:
- Scan QR koden med Expo Go app
- Eller tryk 'w' for web browser
- Eller tryk 'a' for Android emulator
- Eller tryk 'i' for iOS simulator

## Alternative: Kør uden Docker

Hvis du foretrækker at køre PostgreSQL lokalt i stedet for Docker:

1. Installer PostgreSQL med PostGIS lokalt
2. Opret database: `createdb fishlog`
3. Aktiver PostGIS: `psql -d fishlog -c "CREATE EXTENSION postgis;"`
4. Opdater `apps/backend/.env` med din connection string
5. Fortsæt med step 3 ovenfor (Setup Prisma)

## Troubleshooting

### Docker Desktop ikke startet (Windows)
- Åbn Docker Desktop fra Start menuen
- Vent til status viser "Docker Desktop is running"

### Port 5432 allerede i brug
```bash
# Stop evt. eksisterende PostgreSQL service
# Windows Services -> PostgreSQL -> Stop
```

### Backend kan ikke forbinde til database
```bash
# Tjek database status
docker compose logs postgres

# Genstart database
docker compose restart postgres
```

## Projekt Oversigt

```
FishLog/
├── apps/
│   ├── mobile/          ✅ React Native app (Expo) - KLAR
│   │   ├── app/
│   │   │   ├── index.tsx      # Main app med API integration
│   │   │   └── _layout.tsx
│   │   └── package.json
│   └── backend/         ✅ Node.js API (Fastify) - KLAR
│       ├── src/
│       │   └── index.ts       # Server med /health endpoint
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       └── package.json
├── docker-compose.yml   ⏳ PostgreSQL + PostGIS - VENTER PÅ DOCKER
└── package.json         ✅ Root workspace - KLAR
```

## Status

🟢 **Klar til test** - Når Docker er installeret og database er startet
🟡 **Docker installation påkrævet** - Download fra docker.com

Se `QUICKSTART.md` for detaljeret step-by-step guide!
