# Producto plataforma completa

Esta configuración demuestra la derivación del producto más amplio de la línea: base de datos, autenticación, gateway, usuarios, matrículas, calificaciones, notificaciones, solicitudes académicas, portal web y monitoreo de quality gates.

## Derivación

    .\scripts\generate-product.ps1 .\products\producto-plataforma-completa.yml plan
    .\scripts\generate-product.ps1 .\products\producto-plataforma-completa.yml derive

El producto independiente queda en generated/academico-plataforma-completa y conserva un manifiesto con las features, activos, archivos y verificaciones que originaron el resultado.

## Ejecución

    .\generated\academico-plataforma-completa\scripts\start.ps1
    .\generated\academico-plataforma-completa\scripts\status.ps1

Puntos de acceso locales:

- Portal web: https://localhost:8443
- Quality gates: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3007

Los certificados y credenciales incluidos son valores locales de desarrollo. Para detener el producto:

    .\generated\academico-plataforma-completa\scripts\stop.ps1