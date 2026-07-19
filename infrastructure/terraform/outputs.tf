output "namespace" {
  value = kubernetes_namespace_v1.academico.metadata[0].name
}

output "release_status" {
  value = helm_release.academico.status
}
