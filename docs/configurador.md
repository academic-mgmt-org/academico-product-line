# Configurador web

La interfaz web consume directamente el modelo de características y el catálogo de core assets. No mantiene una segunda copia de reglas: `/api/validate` y `/api/derive` usan el mismo motor que la CLI.

## Iniciar

    npm ci
    npm run configurator

Abrir `http://127.0.0.1:4173`. El flujo permite definir identidad, seleccionar capacidades, elegir variantes, validar restricciones y materializar un producto independiente en `generated/<id>`.

Antes de derivar una combinación cuyos activos no estén descargados se ejecuta:

    npm run assets:sync -- products/producto-plataforma-completa.yml

La API solo acepta identificadores normalizados y escribe dentro de la carpeta `generated` del repositorio.
