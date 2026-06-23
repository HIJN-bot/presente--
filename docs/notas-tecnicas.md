# Notas técnicas — Presente

Decisiones de diseño, deuda técnica identificada y próximos pasos. Equivale al `copilot-instructions.md` anterior.

---

## Prioridades para MVP sólido

1. Reemplazar capturas genéricas de excepciones por errores más específicos en routers y servicios
2. Agregar pruebas mínimas para registro, login, creación de clase y asistencia
3. Revisar y normalizar respuestas de los schemas para evitar inconsistencias entre entrada y salida
4. Separar la lógica de negocio de los routers hacia services o repositorios
5. Asegurar que las migraciones reflejen todas las tablas y relaciones nuevas

## Mejoras de arquitectura pendientes

1. Definir una capa clara para asistencia, clases y autenticación
2. Reducir dependencia de relaciones cargadas de forma implícita
3. Ordenar los modelos para que cada entidad tenga una responsabilidad clara

## Calidad

1. Corregir mensajes de error y estados HTTP
2. Unificar naming y tipado en schemas y modelos
3. Agregar documentación mínima de endpoints y flujo principal

## Orden sugerido de trabajo

1. Validar el flujo completo con datos reales
2. Corregir errores funcionales detectados
3. Agregar pruebas
4. Refactorizar routers y servicios
5. Documentar
