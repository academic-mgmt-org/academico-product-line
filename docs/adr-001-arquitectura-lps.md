# ADR-001: Orquestador central con core assets independientes

- Estado: aceptado
- Fecha: 2026-07-19

## Contexto

Los módulos académicos tienen ciclos de vida y repositorios propios. La fábrica debe reutilizarlos sin convertir el repositorio central en un monolito ni copiar proyectos manualmente.

## Decisión

`academico-product-line` mantiene el modelo, catálogo, configuraciones, generador y activos DevOps. Las fuentes de aplicación se adquieren desde las revisiones declaradas en el catálogo y se ensamblan en un directorio independiente según una configuración validada.

## Consecuencias

- La variabilidad queda explícita y comprobable.
- Cada activo puede evolucionar y probarse en su repositorio.
- Una derivación es reproducible mientras las revisiones estén versionadas.
- Cambios incompatibles en activos exigen actualizar el catálogo, pruebas y trazabilidad de la línea.
