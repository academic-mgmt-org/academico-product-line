# Evidencia de cumplimiento de la LPS y fábrica

## Ingeniería de dominio

| Evidencia | Artefacto |
|---|---|
| Alcance y arquitectura de referencia | `docs/ingenieria-dominio.md`, `docs/arquitectura-referencia.md` |
| Features obligatorias, opcionales, XOR y OR | `domain/feature-model.yml` |
| Reglas requires/excludes y binding time | `domain/feature-model.yml`, `domain/variation-points.yml` |
| Catálogo versionado de core assets | `domain/core-assets.yml` |
| Conocimiento de configuración | `domain/configuration-knowledge.yml` |
| Trazabilidad requisito-feature-activo-prueba | `traceability/feature-asset-matrix.yml` |

## Ingeniería de aplicación

| Evidencia | Artefacto |
|---|---|
| Configuraciones concretas válidas | `products/` |
| Validación automática de combinaciones | `scripts/lib/domain.mjs` |
| Adquisición reproducible de activos | `scripts/sync-assets.mjs` |
| Ensamblado independiente | `scripts/lib/derive.mjs` |
| Configurador visual | `configurator/` |
| Manifiesto y plan de verificación generado | `product-manifest.json`, `tests/verification-plan.json` del producto derivado |

## Operación de la fábrica

| Evidencia | Artefacto |
|---|---|
| Pruebas y cobertura mínima del 80% | `.github/workflows/quality.yml` |
| SAST, SCA, secretos y Trivy | `.github/workflows/security.yml` |
| Imágenes versionadas en GHCR | `.github/workflows/publish-images.yml` |
| Staging automático y producción protegida | `.github/workflows/deploy.yml` |
| Kubernetes resiliente | `k8s/chart/academico-product/` |
| Infraestructura como código | `infrastructure/terraform/` |
| SLI, SLO, alertas, logs y DORA | `observability/` |
| Rollback y aprendizaje de incidentes | `docs/deployment-observability.md`, `docs/postmortem-template.md` |

El repositorio demuestra una plataforma que modela, valida, ensambla, prueba, despliega y observa una familia de productos. Los repositorios de dominio permanecen como core assets independientes y el producto final se materializa sin sus historiales `.git`.
