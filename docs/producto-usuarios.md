# Producto con Usuarios

Esta variante extiende el producto minimo con el microservicio
`academico-usuarios`. Reutiliza PostgreSQL, Login, Gateway y las migraciones del
esquema central.

## Preparar y ejecutar en Windows

```powershell
Copy-Item .env.example .env
.\scripts\bootstrap-usuarios.ps1
docker compose -f compose.yaml -f compose.override.yaml -f compose.usuarios.yaml up --build -d
docker compose -f compose.yaml -f compose.override.yaml -f compose.usuarios.yaml ps
```

Puertos locales predeterminados:

- PostgreSQL: `5432`
- Login: `3001`
- Usuarios: `3002`
- Gateway gRPC: `50050`

Para detener esta variante sin borrar los datos:

```powershell
docker compose -f compose.yaml -f compose.override.yaml -f compose.usuarios.yaml down
```

La seleccion de caracteristicas se encuentra en
`products/producto-usuarios.yml`.
