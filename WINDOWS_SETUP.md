# Windows Setup Guide 🪟

Komplet guide til at få FishLog kørende på Windows.

## Forudsætninger

### 1. Node.js ✅
Allerede installeret (da npm install virkede)

### 2. Docker Desktop ⏳

**Download:**
- Gå til: https://www.docker.com/products/docker-desktop
- Klik "Download for Windows"
- Kør installationsfilen

**Installation:**
1. Åbn den downloadede `.exe` fil
2. Følg installationsguiden
3. Genstart computeren når prompted
4. Start Docker Desktop fra Start menuen
5. Accepter service agreement
6. Vent til status viser "Docker Desktop is running" (grøn ikon i bundbjælken)

**Verificer installation:**
```powershell
docker --version
docker compose version
```

Forventet output:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

## Komplet Setup Trin-for-Trin

### Step 1: Åbn PowerShell eller Command Prompt

Naviger til projekt mappen:
```powershell
cd C:\ClaudeCodeProject\FishLog
```

### Step 2: Start Docker Desktop

- Åbn Docker Desktop fra Start menuen
- Vent til det er grønt nederst til højre
- Lad det køre i baggrunden

### Step 3: Start Database

```powershell
docker compose up -d
```

Tjek at det kører:
```powershell
docker compose ps
```

Du skulle se:
```
NAME                  STATUS          PORTS
fishlog-postgres      Up 10 seconds   0.0.0.0:5432->5432/tcp
```

### Step 4: Setup Backend Database

Åbn en ny terminal og naviger til backend:

```powershell
cd apps\backend
npx prisma generate
npx prisma migrate dev --name init
```

Du vil blive spurgt om navn til migration - tryk bare Enter.

### Step 5: Start Backend Server

I samme terminal (apps\backend):

```powershell
npm run dev
```

Du skulle se:
```
🚀 Server running on http://0.0.0.0:3000
```

**Test backend** i ny terminal:
```powershell
curl http://localhost:3000/health
```

Eller åbn i browser: http://localhost:3000/health

Forventet JSON response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

### Step 6: Start Mobile App

Åbn en **NY terminal** og naviger til mobile:

```powershell
cd C:\ClaudeCodeProject\FishLog\apps\mobile
npm run dev
```

### Step 7: Åbn Appen

Du får en QR kode i terminalen. Vælg en metode:

**Option A: Fysisk Telefon**
1. Download "Expo Go" app fra App Store (iOS) eller Google Play (Android)
2. Åbn Expo Go
3. Scan QR koden

⚠️ **Vigtigt for fysisk telefon:**
Din telefon skal være på samme WiFi som din computer!

Hvis du får "Network Error", opdater `apps\mobile\app\index.tsx`:
```typescript
// Find din computers IP adresse først:
// PowerShell: ipconfig
// Find IPv4 Address under WiFi adapter

// Skift denne linje:
const API_URL = 'http://localhost:3000';
// Til:
const API_URL = 'http://192.168.1.XXX:3000'; // Din IP
```

**Option B: Web Browser (Hurtigst til test)**
- Tryk **'w'** i terminalen
- Browser åbner automatisk

**Option C: Android Emulator**
1. Installer Android Studio
2. Setup en Android Virtual Device (AVD)
3. Start emulatoren
4. Tryk **'a'** i Expo terminalen

**Option D: iOS Simulator (Kun Mac)**
- Ikke tilgængelig på Windows

## Verificer at Alt Virker

I appen skulle du se:

✅ "Hello World 🐟"
✅ "FishLog App"
✅ "Backend Status: API OK - healthy"

Hvis status er grøn - tillykke! Alt virker! 🎉

## Almindelige Problemer

### Problem: "docker: command not found"
**Løsning:**
- Docker Desktop er ikke startet eller ikke installeret
- Åbn Docker Desktop og vent til det er grønt
- Genstart terminal efter installation

### Problem: Port 5432 allerede i brug
**Løsning:**
```powershell
# Stop eksisterende PostgreSQL service
# Tryk Windows + R
# Skriv: services.msc
# Find PostgreSQL service
# Højreklik -> Stop
```

Eller skift port i `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Brug 5433 i stedet
```

Og opdater `apps\backend\.env`:
```
DATABASE_URL="postgresql://fishlog:fishlog123@localhost:5433/fishlog?schema=public"
```

### Problem: "Connection Failed" i mobile app
**Løsning 1:** Tjek at backend kører
```powershell
curl http://localhost:3000/health
```

**Løsning 2:** Hvis du bruger fysisk telefon, brug din computers IP:
```powershell
ipconfig
```
Find din IPv4 adresse (fx 192.168.1.45) og opdater API_URL i `apps\mobile\app\index.tsx`

**Løsning 3:** Tjek firewall
- Windows Defender Firewall kan blokere port 3000
- Åbn Windows Defender Firewall -> Allow an app
- Tillad Node.js gennem firewallen

### Problem: Expo QR kode scanner virker ikke
**Løsning:**
- Brug web versionen i stedet (tryk 'w')
- Eller brug Expo Go app's "Enter URL manually" og indtast URL fra terminalen

## Stop Alt

Når du er færdig:

```powershell
# Stop Expo (tryk Ctrl+C i mobile terminal)
# Stop Backend (tryk Ctrl+C i backend terminal)

# Stop database
docker compose down

# Eller stop med data bevarelse
docker compose stop
```

## Database Administration

**Prisma Studio** (GUI til database):
```powershell
cd apps\backend
npx prisma studio
```
Åbner på http://localhost:5555

**Docker logs**:
```powershell
docker compose logs postgres
docker compose logs -f postgres  # Follow logs
```

**Database backup**:
```powershell
docker exec fishlog-postgres pg_dump -U fishlog fishlog > backup.sql
```

## Næste Skridt

Nu hvor alt er sat op, kan du:
1. Udforske PostGIS features til lokationssporing
2. Tilføje nye API endpoints
3. Bygge mere UI i React Native appen
4. Implementere autentifikation

Se `README.md` for mere information! 📚
