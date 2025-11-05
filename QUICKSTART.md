# Quick Start Guide 🚀

Følg disse trin for at få FishLog op at køre:

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Database

```bash
docker-compose up -d
```

Vent 10-15 sekunder til databasen er klar.

## 3. Setup Backend

```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 4. Start Backend (i en terminal)

```bash
cd apps/backend
npm run dev
```

Du skulle se: `🚀 Server running on http://0.0.0.0:3000`

## 5. Test Backend

Åbn en ny terminal og test:

```bash
curl http://localhost:3000/health
```

Forventet response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "database": "connected",
  "version": "1.0.0"
}
```

## 6. Start Mobile App (i en ny terminal)

```bash
cd apps/mobile
npm install
npm run dev
```

## 7. Åbn Appen

- Scan QR koden med **Expo Go** app på din telefon
- Eller tryk **'w'** for at åbne i browser
- Eller tryk **'i'** for iOS simulator
- Eller tryk **'a'** for Android emulator

## 8. Verificer Integration

I appen skulle du se:
- ✅ "Hello World 🐟"
- ✅ "Backend Status: API OK - healthy"

Hvis du ser "Connection Failed":
1. Sørg for backend kører
2. Hvis du bruger fysisk enhed, opdater `API_URL` i `apps/mobile/app/index.tsx` til din computers IP-adresse

## Troubleshooting

### "Connection Failed" på fysisk enhed

Rediger `apps/mobile/app/index.tsx`:

```typescript
// Skift fra:
const API_URL = 'http://localhost:3000';

// Til din computers IP (find med ipconfig på Windows eller ifconfig på Mac/Linux):
const API_URL = 'http://192.168.1.XXX:3000';
```

### Database connection errors

```bash
# Genstart database
docker-compose restart postgres

# Tjek logs
docker-compose logs postgres
```

### Port already in use

```bash
# Find og stop processen på port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

## Næste Skridt

Nu er dit projekt klar! Du kan:
- Tilføje nye API endpoints i `apps/backend/src/index.ts`
- Bygge UI komponenter i `apps/mobile/app/index.tsx`
- Udvide database schema i `apps/backend/prisma/schema.prisma`
- Bruge PostGIS til lokationsbaserede features

Læs mere i `README.md` 📖
