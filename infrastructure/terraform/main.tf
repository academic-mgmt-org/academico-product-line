provider "kubernetes" {
  config_path = pathexpand(var.kubeconfig_path)
}

provider "helm" {
  kubernetes {
    config_path = pathexpand(var.kubeconfig_path)
  }
}

resource "kubernetes_namespace_v1" "academico" {
  metadata {
    name = "${var.namespace}-${var.environment}"
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }
}

resource "helm_release" "academico" {
  name      = "academico"
  namespace = kubernetes_namespace_v1.academico.metadata[0].name
  chart     = "${path.module}/../../k8s/chart/academico-product"
  atomic    = true
  wait      = true
  timeout   = 600

  set {
    name  = "global.registry"
    value = var.image_registry
  }
  set {
    name  = "global.imageTag"
    value = var.image_tag
  }
  set_sensitive {
    name  = "secret.databasePassword"
    value = var.database_password
  }
  set_sensitive {
    name  = "secret.jwtSecret"
    value = var.jwt_secret
  }
}
