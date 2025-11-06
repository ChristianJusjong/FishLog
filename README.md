# Hook 🎣

[![CI Pipeline](https://github.com/USERNAME/fishlog/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/fishlog/actions/workflows/ci.yml)
[![Security Scan](https://github.com/USERNAME/fishlog/actions/workflows/security-scan.yml/badge.svg)](https://github.com/USERNAME/fishlog/actions/workflows/security-scan.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Hook - Din digitale fiskebog. En React Native mobilapp til at logge fisketure, bygget med Node.js backend og PostgreSQL/PostGIS database i en Turborepo monorepo struktur.

## 🎯 Features

✅ **Production-Ready CI/CD**
- Automated testing and building
- Security scanning with multiple tools
- Automated dependency updates
- Continuous deployment to staging/production

✅ **Security First**
- Daily vulnerability scans
- Automated security patches
- Secret detection
- Container security hardening

## Projekt Struktur

```
Hook/
├── apps/
│   ├── mobile/          # React Native app (Expo)
│   └── backend/         # Node.js API (Fastify)
├── packages/            # Delte packages (fremtidigt)
├── docker-compose.yml   # PostgreSQL med PostGIS
└── turbo.json          # Turborepo konfiguration
```

## Teknologi Stack

- **Frontend**: React Native med Expo
- **Backend**: Node.js med Fastify
- **Database**: PostgreSQL 16 med PostGIS 3.4
- **ORM**: Prisma
- **Monorepo**: Turborepo
- **Container**: Docker Compose

## Kom i Gang

### Forudsætninger

- Node.js 18+
- npm eller yarn
- Docker & Docker Compose
- Expo CLI (valgfrit)

### Installation

1. **Installer dependencies**
   ```bash
   npm install
   ```

2. **Start database**
   ```bash
   docker-compose up -d
   ```

3. **Opsæt Prisma og kør migrations**
   ```bash
   cd apps/backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start backend server**
   ```bash
   cd apps/backend
   npm run dev
   ```
   Backend kører nu på http://localhost:3000

5. **Test healthcheck endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

6. **Start mobile app** (i en ny terminal)
   ```bash
   cd apps/mobile
   npm install
   npm run dev
   ```

7. **Åbn appen**
   - Scan QR koden med Expo Go app (iOS/Android)
   - Tryk 'i' for iOS simulator
   - Tryk 'a' for Android emulator
   - Tryk 'w' for web browser

### Test API Integration

Når både backend og mobile app kører:

1. Åbn mobile appen
2. Du skulle se "Hello World 🐟" og "FishLog App"
3. Under "Backend Status" skulle der stå "API OK - healthy"
4. Tryk på "Refresh API Status" for at teste forbindelsen igen

## Endpoints

### Backend API

- `GET /` - Root endpoint med API info
- `GET /health` - Healthcheck (tjekker også database connection)

## Database

PostgreSQL databasen kører i Docker med PostGIS extension aktiveret.

**Connection details:**
- Host: localhost
- Port: 5432
- Database: fishlog
- User: fishlog
- Password: fishlog123

**Administrer database:**
```bash
cd apps/backend
npx prisma studio
```

## Scripts

### Root level
- `npm run dev` - Start alle apps i dev mode
- `npm run build` - Build alle apps

### Backend (apps/backend)
- `npm run dev` - Start backend med hot reload
- `npm run build` - Build til production
- `npm run db:migrate` - Kør database migrations
- `npm run db:studio` - Åbn Prisma Studio

### Mobile (apps/mobile)
- `npm run dev` - Start Expo dev server
- `npm run android` - Start på Android
- `npm run ios` - Start på iOS
- `npm run web` - Start i browser

## 🚀 CI/CD & DevOps

This project includes a complete CI/CD pipeline with:

- **Continuous Integration**: Automated testing, linting, and building
- **Continuous Deployment**: Automated deployments to staging and production
- **Security Scanning**: Multiple security tools (Trivy, CodeQL, Semgrep, Snyk, Gitleaks)
- **Dependency Management**: Automated weekly updates via Dependabot
- **Container Support**: Production-ready Docker setup
- **Pull Request Automation**: Auto-labeling, size checks, review checklists

### 📚 Documentation

- **[CI/CD Quick Reference](CI_CD_QUICK_REFERENCE.md)** - Quick guide for common tasks
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment documentation
- **[Security Policy](SECURITY.md)** - Security practices and reporting

### 🔄 Package Updates

All packages have been updated to their latest versions:
- Backend: Fastify 5.x, Prisma 6.x, Node types 24.x
- Mobile: Expo 54.x, React Native 0.76.x, React 18.3.x
- CI/CD: Latest GitHub Actions
- Security: Multiple automated scanners

## Fremtidige Features

- [ ] Bruger autentifikation
- [ ] Log fisketure med lokation (PostGIS)
- [ ] Upload billeder af fangster
- [ ] Statistik og visualiseringer
- [ ] Deling af fangster
- [ ] Vejr integration

## Troubleshooting

### Backend kan ikke forbinde til database
```bash
# Tjek at Docker container kører
docker ps

# Genstart database
docker-compose restart postgres

# Tjek logs
docker-compose logs postgres
```

### Mobile app kan ikke forbinde til backend
- Sørg for at backend kører på http://localhost:3000
- Hvis du bruger fysisk enhed: Opdater API_URL i `apps/mobile/app/index.tsx` til din computer's IP
- Tjek firewall indstillinger

### Prisma errors
```bash
cd apps/backend
npx prisma generate
npx prisma migrate reset
```

## License

MIT
