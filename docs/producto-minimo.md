# Producto minimo

La primera variante integra PostgreSQL, las migraciones del esquema central,
`academico-login` y `academico-gateway`.

## Requisitos

- Git
- Docker Desktop con el motor Linux iniciado
- Docker Compose

## Preparar y ejecutar en Windows

```powershell
Copy-Item .env.example .env
.\scripts\bootstrap.ps1
docker compose up --build -d
docker compose ps
```

Los activos se descargan en `services/`, que no se versiona. De esta manera el
orquestador reutiliza los repositorios originales sin copiar su codigo.

Puertos locales predeterminados:

- PostgreSQL: `5432`
- Login: `3001`
- Gateway gRPC: `50050`

Para detener el producto sin borrar los datos:

```powershell
docker compose down
```

La seleccion de caracteristicas de esta variante se encuentra en
`products/producto-minimo.yml`.
