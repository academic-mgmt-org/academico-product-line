# Generador de productos

El generador lee una definicion de `products/`, valida sus caracteristicas y
selecciona automaticamente los archivos Compose necesarios.

## Ver el plan

```powershell
.\scripts\generate-product.ps1 .\products\producto-minimo.yml
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml
```

Cada ejecucion guarda la seleccion resuelta en
`generated/<producto>/selection.json`. La carpeta `generated/` no se versiona.

## Iniciar un producto

```powershell
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml up
```

El generador ejecuta el bootstrap correspondiente y levanta solo los Compose
necesarios para las caracteristicas activas.

## Detener un producto

```powershell
.\scripts\generate-product.ps1 .\products\producto-usuarios.yml down
```

Este comando conserva el volumen PostgreSQL. No usa `down -v`.

## Ejecutar las pruebas del selector

```powershell
.\tests\generator.tests.ps1
```
