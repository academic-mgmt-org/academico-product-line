# Despliegue y observabilidad

El chart `k8s/chart/academico-product` despliega los componentes seleccionados con rolling updates, readiness/liveness probes, requests/limits, HPA de 2 a 10 réplicas y PodDisruptionBudget. ConfigMap contiene valores no sensibles y Secret recibe credenciales durante el despliegue.

Terraform crea un namespace por ambiente y administra el release Helm de manera atómica. Si una actualización falla, Helm revierte el release automáticamente.

## Terraform

    cd infrastructure/terraform
    terraform init
    terraform plan -var image_tag=v1.0.0 -var database_password=... -var jwt_secret=...
    terraform apply

No se deben guardar secretos ni archivos `.tfvars` reales en Git.

## Operación

Los SLI/SLO están en `observability/slo.yml`; las cuatro métricas DORA y el contrato de logs estructurados están en `observability/dora-metrics.yml`. Las reglas Prometheus se activan con `monitoring.enabled=true` cuando el clúster dispone de Prometheus Operator.

Ante un incidente se ejecuta `helm rollback academico`, se registra tiempo de recuperación y se crea un post-mortem sin culpables usando `docs/postmortem-template.md`.
