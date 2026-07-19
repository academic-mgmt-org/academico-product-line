# Generador de productos

El generador lee la definicion seleccionada y los artefactos de ingenieria de dominio. Valida obligatoriedad, dependencias `requires`, incompatibilidades `excludes`, grupos XOR/OR, disponibilidad de activos y trazabilidad.

## Preparacion

```powershell
npm ci
npm run validate:domain
npm test
```

## Ver un plan

```powershell
.\scripts\generate-product.ps1 .\products\producto-minimo.yml plan
```

El resultado reproducible se guarda en `generated/<producto>/selection.json` e incluye features, variantes, repositorios, revisiones, Compose y pruebas relacionadas.

## Iniciar y detener

```powershell
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml up
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml down
```

`up` adquiere o actualiza solo los core assets seleccionados y ensambla los fragmentos Compose registrados. `down` conserva los volumenes de datos.
