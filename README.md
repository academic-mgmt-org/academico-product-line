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

La variante de demostración con los nueve core assets está documentada en
docs/producto-plataforma-completa.md.

## Fuentes de verdad

- `domain/feature-model.yml`: modelo de caracteristicas y restricciones.
- `domain/core-assets.yml`: catalogo versionado de activos reutilizables.
- `domain/configuration-knowledge.yml`: reglas de ensamblado.
- `domain/variation-points.yml`: puntos y momentos de variacion.
- `traceability/feature-asset-matrix.yml`: trazabilidad de requisitos a pruebas.
- `products/`: configuraciones concretas de productos.

Consulta `docs/ingenieria-dominio.md`, `docs/arquitectura-referencia.md` y `docs/generador-productos.md` para el detalle.
