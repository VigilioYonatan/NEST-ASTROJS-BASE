# Astro-Test API

Full-stack app: **NestJS** + **Astro** + **PostgreSQL** + **Dragonfly**

## 📦 Librerías Principales

| Backend      | Frontend        | Infra             |
| ------------ | --------------- | ----------------- |
| NestJS 11    | Astro 5         | PostgreSQL        |
| Drizzle ORM  | Preact          | Dragonfly (Redis) |
| Passport JWT | TailwindCSS     | MinIO/RustFS      |
| Zod          | React Hook Form | Docker            |

## 🚀 Setup Rápido

```bash
# 1. Instalar
pnpm install

# 2. Configurar
cp .env.example .env

# 3. Levantar servicios
docker compose up -d

# 4. Base de datos
pnpm run db:push
pnpm run db:seed

# 5. Desarrollo
pnpm serve    # Backend :3000
pnpm dev      # Frontend :4321
```

## 🔄 CI/CD Pipeline

Este proyecto usa **Gitea Actions** para CI/CD automatizado.

### Flujo de Trabajo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   develop   │ ──► │   staging   │ ──► │    main     │
│  (feature)  │     │  (testing)  │     │   (prod)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Branches y CI

| Branch      | CI          | Deploy            |
| ----------- | ----------- | ----------------- |
| `main`      | ✅ Completo | ❌ Manual (tag)   |
| `develop`   | ✅ Completo | ✅ Auto → Staging |
| `feature/*` | ❌ No       | ❌ No             |
| `wip/*`     | ❌ No       | ❌ No             |

### Deploy a Producción

```bash
# 1. Crear tag con versión semántica
git tag v1.0.0

# 2. Push del tag (dispara deploy automático)
git push origin v1.0.0
```

### Rollback

```bash
# En el servidor
export IMAGE_TAG=1.0.0   # versión anterior
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

## 💾 Guardar Trabajo (Cambiar de PC)

Si necesitas guardar tu trabajo para continuar en otro PC:

```bash
# PC Actual - Guardar trabajo
git checkout -b wip/mi-trabajo
git add .
git commit -m "wip: trabajo en progreso"
git push origin wip/mi-trabajo

# Otro PC - Recuperar trabajo
git fetch && git checkout wip/mi-trabajo
```

> **Nota:** Las branches `wip/*` no disparan CI, puedes pushear código incompleto.

### Después de terminar

```bash
# Merge a develop
git checkout develop
git merge wip/mi-trabajo
git push origin develop

# Borrar branch wip
git branch -d wip/mi-trabajo
git push origin --delete wip/mi-trabajo
```

## 🔐 Secrets Requeridos (Gitea)

Configurar en: **Settings → Secrets**

| Secret              | Descripción                  | Cómo obtenerlo                                            |
| ------------------- | ---------------------------- | --------------------------------------------------------- |
| `REGISTRY_USERNAME` | Usuario de Gitea             | Tu usuario de login en Gitea                              |
| `REGISTRY_TOKEN`    | Token de acceso              | Gitea → Settings → Applications → Generate Token          |
| `SERVER_IP`         | IP del servidor              | IP pública de tu VPS/servidor                             |
| `SERVER_USER`       | Usuario SSH                  | Usuario con acceso SSH (ej: `dokploy`, `root`)            |
| `SSH_PRIVATE_KEY`   | Llave SSH privada            | `cat ~/.ssh/id_rsa` (la llave privada completa)           |
| `SSH_PORT`          | Puerto SSH                   | Por defecto `22`, o tu puerto personalizado               |
| `PROD_ENV_FILE`     | Contenido de .env producción | Copia todo el contenido de tu `.env` de producción        |
| `STAGING_ENV_FILE`  | Contenido de .env staging    | Copia todo el contenido de tu `.env` de staging           |
| `DISCORD_WEBHOOK`   | Webhook para notificaciones  | Discord → Server Settings → Integrations → Webhooks → New |

## 📚 Documentación

-   [Arquitectura y Prácticas](./docs/ARCHITECTURE.md)
-   [API Reference](/reference) - Swagger/Scalar
-   [Postman Collection](./docs/postman.json)

## 🧞 Comandos

| Comando               | Descripción          |
| --------------------- | -------------------- |
| `pnpm dev`            | Astro dev server     |
| `pnpm serve`          | NestJS dev server    |
| `pnpm test`           | Ejecutar tests       |
| `pnpm test:e2e`       | Tests E2E            |
| `pnpm run biome`      | Lint y formato       |
| `pnpm run db:migrate` | Ejecutar migraciones |
| `pnpm run db:push`    | Push schema a DB     |
| `pnpm run db:studio`  | Drizzle Studio       |

## 📄 Licencia

MIT
