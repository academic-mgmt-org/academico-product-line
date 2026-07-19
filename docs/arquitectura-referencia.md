# Arquitectura de referencia

La linea de productos ensambla un sistema academico a partir de servicios y
activos versionados de forma independiente. La arquitectura separa el plano de
la fabrica del producto derivado.

## Plano de la fabrica

- El modelo de caracteristicas define combinaciones validas.
- El catalogo identifica los core assets y sus repositorios.
- El conocimiento de configuracion relaciona features con activos y acciones.
- El generador valida, adquiere, ensambla, configura y verifica el producto.
- La matriz de trazabilidad conserva la relacion entre requisito, feature,
  activo, artefacto y prueba.

## Plano del producto

```text
Cliente
  |
  v
Gateway gRPC
  |-- Login
  |-- Usuarios (opcional)
  |-- Matriculas (opcional)
  |-- Calificaciones (opcional)
  `-- Notificaciones (opcional)
          |
          v
PostgreSQL + migraciones centralizadas
```

La interfaz web es opcional y consume las capacidades expuestas por el
Gateway. Los controles de calidad, la observabilidad y el destino de despliegue
son variaciones de plataforma y no capacidades del dominio academico.

## Principios

1. Cada capacidad se activa mediante una feature explicita.
2. Ninguna dependencia se decide manualmente durante la derivacion.
3. Cada feature debe mapear a activos, configuracion y verificaciones.
4. Los productos derivados deben ser reproducibles a partir de su definicion.
5. Los secretos no forman parte de los core assets ni de las configuraciones
   versionadas.
