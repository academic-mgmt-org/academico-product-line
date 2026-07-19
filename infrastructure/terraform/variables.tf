variable "kubeconfig_path" {
  description = "Ruta al kubeconfig del clúster objetivo"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  type    = string
  default = "academico"
}

variable "environment" {
  type    = string
  default = "staging"
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment debe ser staging o production."
  }
}

variable "image_registry" {
  type    = string
  default = "ghcr.io/academic-mgmt-org"
}

variable "image_tag" {
  type = string
}

variable "database_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}
