# Runbook de la fábrica

## Validar la plataforma

    npm ci
    npm run validate:domain
    npm run test:coverage
    helm lint k8s/chart/academico-product
    terraform -chdir=infrastructure/terraform validate

## Derivar un producto

    npm run assets:sync -- products/producto-plataforma-completa.yml
    npm run generate -- products/producto-plataforma-completa.yml derive
    .\generated\academico-plataforma-completa\scripts\start.ps1

## Diagnóstico

1. Revisar `product-manifest.json` para confirmar features y revisiones.
2. Ejecutar `scripts/status.ps1` en el producto.
3. Revisar `docker compose logs <servicio>` o los logs JSON del clúster.
4. Consultar Prometheus/Grafana y determinar qué SLI fue afectado.
5. Si una promoción falla, Helm revierte por `--atomic`; también puede ejecutarse `helm rollback academico`.
6. Registrar el incidente y las acciones en la plantilla de post-mortem.

## Recuperación de una derivación

La carpeta `generated/` es descartable. Se corrige la configuración o el catálogo, se vuelve a validar y se deriva otra vez. Los core assets originales no se modifican durante este proceso.
