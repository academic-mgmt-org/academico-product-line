# Generador de productos

El generador lee la definicion seleccionada y los artefactos de ingenieria de
dominio. Valida obligatoriedad, dependencias `requires`, incompatibilidades
`excludes`, grupos XOR/OR, disponibilidad de activos y trazabilidad.

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

El resultado se guarda en `generated/<producto>/selection.json` e incluye
features, variantes, repositorios, revisiones, Compose y pruebas relacionadas.

## Derivar un producto independiente

```powershell
.\scripts\generate-product.ps1 .\products\producto-minimo.yml derive
```

La carpeta `generated/<producto>/` contiene los core assets seleccionados sin
sus historiales Git, Docker, configuracion, scripts de ciclo de vida, pruebas,
README y el manifiesto trazable del producto.

## Iniciar y detener

```powershell
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml up
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml down
```

`up` deriva el producto y lo inicia desde su propia carpeta. `down` conserva los
volumenes de datos.
