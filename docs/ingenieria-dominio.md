# Ingenieria de dominio

Este repositorio es la plataforma de la fabrica y no un producto academico
final. Sus artefactos de dominio son la fuente de verdad para derivar la familia
de productos.

| Artefacto | Responsabilidad |
| --- | --- |
| `domain/feature-model.yml` | Features, cardinalidades y restricciones |
| `domain/core-assets.yml` | Catalogo versionado de activos reutilizables |
| `domain/configuration-knowledge.yml` | Reglas para ensamblar cada feature |
| `domain/variation-points.yml` | Variantes, mecanismos y momento de resolucion |
| `traceability/feature-asset-matrix.yml` | Trazabilidad de requisitos a verificaciones |
| `docs/arquitectura-referencia.md` | Estructura comun de la familia de productos |

## Separacion de procesos

La ingenieria de dominio mantiene estos modelos y prepara los core assets. La
ingenieria de aplicacion comienza con una definicion en `products/`, valida su
seleccion y genera un producto concreto usando exclusivamente los artefactos
registrados.

Una caracteristica marcada como `planned` pertenece al alcance de la linea,
pero aun no puede seleccionarse en un producto ejecutable. Esta distincion evita
presentar como disponible una capacidad que todavia no tiene ensamblado y
verificacion implementados.
