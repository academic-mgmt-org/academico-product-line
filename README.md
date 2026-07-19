# academico-product-line

Fabrica de software para modelar, validar y derivar productos de la familia del Sistema de Gestion Academica.

## Preparacion

```powershell
npm ci
npm run validate:domain
npm test
```

## Derivar un producto

```powershell
.\scripts\generate-product.ps1 .\products\producto-minimo.yml plan
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml up
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml down
```

La variante de demostración con los diez core assets está documentada en
docs/producto-plataforma-completa.md.

## Configurador visual

    npm run assets:sync -- products/producto-plataforma-completa.yml
    npm run configurator

Abre http://127.0.0.1:4173, selecciona capacidades y variantes, valida la combinación y deriva el producto. La guía está en docs/configurador.md.

## Plataforma DevOps

- Calidad, seguridad, publicación y promoción: docs/ci-cd.md.
- Kubernetes, Terraform, observabilidad y rollback: docs/deployment-observability.md.
- Evidencia completa frente al marco teórico: docs/cumplimiento-lps.md.
- Operación cotidiana: docs/runbook.md.
## Fuentes de verdad

- `domain/feature-model.yml`: modelo de caracteristicas y restricciones.
- `domain/core-assets.yml`: catalogo versionado de activos reutilizables.
- `domain/configuration-knowledge.yml`: reglas de ensamblado.
- `domain/variation-points.yml`: puntos y momentos de variacion.
- `traceability/feature-asset-matrix.yml`: trazabilidad de requisitos a pruebas.
- `products/`: configuraciones concretas de productos.

Consulta `docs/ingenieria-dominio.md`, `docs/arquitectura-referencia.md` y `docs/generador-productos.md` para el detalle.
