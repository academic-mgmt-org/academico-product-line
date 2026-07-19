# Producto academico completo

Esta configuracion demuestra la composicion de siete core assets de backend:
Base de datos, Login, Gateway, Usuarios, Matriculas, Calificaciones y
Notificaciones.

## Dependencias resueltas

```text
database <- login <- gateway
    |         |
    |         `---- usuarios <- notificaciones
    |                  |
    |                  `---- matriculas <- calificaciones
    `----------------------- servicios persistentes
```

La seleccion activa los canales de notificacion `email` e `in_app`. El proveedor
de correo local usa el modo `log`, por lo que no requiere credenciales externas.

## Ejecucion

```powershell
.\scripts\generate-product.ps1 .\products\producto-academico-completo.yml derive
.\scripts\generate-product.ps1 .\products\producto-academico-completo.yml up
.\scripts\generate-product.ps1 .\products\producto-academico-completo.yml down
```

La derivacion genera una copia independiente de los ocho activos y un plan de
verificacion trazable en `generated/academico-completo/tests/`.
