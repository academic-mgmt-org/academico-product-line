{{- define "academico.labels" -}}
app.kubernetes.io/part-of: academico
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
