# CI/CD y seguridad

La fábrica aplica tres pipelines:

- `quality.yml`: valida el modelo, ejecuta pruebas con cobertura mínima del 80%, audita dependencias y deriva un producto de humo.
- `security.yml`: ejecuta CodeQL (SAST), Dependency Review y npm audit (SCA), Gitleaks para secretos y Trivy para el sistema de archivos.
- `publish-images.yml`: sincroniza los core assets, construye imágenes multi-stage, las publica en GHCR y escanea cada imagen con Trivy.

Las imágenes se publican al crear una etiqueta `v*` o mediante ejecución manual. El token efímero de GitHub Actions se usa para GHCR; no se guardan contraseñas de registro en el repositorio.

La promoción a staging y producción se define en el pipeline de despliegue junto con los manifiestos Kubernetes. Producción usa un Environment protegido para exigir aprobación.
