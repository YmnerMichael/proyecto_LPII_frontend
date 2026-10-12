# Informe de hallazgos y experiencia de usuario — Sesión 9

> **Borrador para completar tras ejecutar la matriz.** Los resultados, los hallazgos y sus evidencias están pendientes; no se han inferido ni inventado. Exportar a `docs/informe-s9.pdf` después de completar este documento.

## C1. Resumen de ejecución

Completar con los resultados de [la matriz de pruebas](./matriz-pruebas-s9.md). No marcar una prueba como aprobada o fallida sin su evidencia.

| Grupo | Ejecutados | Pasan | Fallan |
| --- | ---: | ---: | ---: |
| Buscadores |  |  |  |
| Cálculos |  |  |  |
| Validaciones |  |  |  |
| Confirmación |  |  |  |
| Mensajes / concurrencia |  |  |  |
| Fechas (propio) |  |  |  |
| Impresión |  |  |  |
| Consistencia |  |  |  |
| Usabilidad, API y reportes (propios) |  |  |  |
| **Total** |  |  |  |

**Conclusión basada en evidencia:** Pendiente de ejecutar la matriz y registrar el total de casos aprobados y fallidos.

## C2. Fichas de hallazgos

Por cada fila marcada **Falla** en la matriz, copiar esta ficha, adjuntar la evidencia y confirmar la causa antes de proponer el arreglo. Si todos los casos pasan, indicar «No se encontraron fallos en los casos ejecutados» y enlazar las evidencias.

### Hallazgo [ID pendiente]

- **Descripción y resultado esperado/obtenido:** Pendiente.
- **Severidad:** Pendiente de evaluar impacto y alcance.
- **Evidencia:** Pendiente (`evidencias/[ID]_...`).
- **Causa comprobada:** Pendiente de inspección; anotar archivo, método y capa.
- **Corrección propuesta:** Pendiente; ubicarla en la capa responsable (SPA o backend).

## C3. Preguntas de análisis

### 1. ¿Por qué el total de la SPA es solo un total estimado? ¿Qué pasaría si el backend aceptara el total del navegador?

La SPA calcula el total para orientar al cajero durante la preparación de la venta, pero el navegador y sus datos no son una fuente de autoridad: el precio puede cambiar, el stock puede modificarse por otra caja y un cliente podría alterar la petición. El backend debe recalcular subtotales y total usando sus precios vigentes dentro de la transacción. Si aceptara el total enviado por el navegador, un cliente podría manipularlo y registrar importes menores o incoherentes; además, el comprobante, los pagos y los datos contables dejarían de ser confiables.

### 2. En V-05, ¿debería la API aceptar el mismo producto en dos líneas?

La regla elegida debe ser explícita y verificarse con la API. Lo más claro para mantener un comprobante legible es consolidar cantidades del mismo producto en una única línea, ya sea en la capa de servicio o mediante validación de dominio en el backend. Si se permiten dos líneas, el backend debe descontar la suma de ambas cantidades de forma atómica, verificar stock para el total combinado y guardar subtotales coherentes; no debe validar cada línea contra el stock inicial y terminar vendiendo más unidades de las disponibles. Documentar aquí la respuesta HTTP, el stock final y el comprobante obtenidos en V-05.

### 3. ¿Qué mejora de experiencia aplicar después del 409 de M-01?

Tras el 409 por stock concurrente, conservar cliente y líneas válidas, identificar el producto afectado, volver a consultar su stock y mostrarlo junto al mensaje del backend. Si el stock actualizado es menor que la cantidad, resaltar el control de cantidad y permitir al cajero corregirlo sin rehacer el resto de la venta; nunca reenviar automáticamente una operación transaccional que el servidor rechazó.

### 4. ¿Por qué el reporte por categoría puede no estar paginado mientras la consulta de ventas sí?

El reporte entrega una fila agregada por categoría, normalmente un conjunto pequeño y acotado, independientemente de cuántas ventas contribuyeron al cálculo; paginar esas filas aportaría poco. La consulta de ventas devuelve una fila por operación, y ese conjunto crece continuamente, así que necesita paginación para limitar la respuesta, el tiempo de transferencia y el volumen que el usuario recorre. Si el catálogo de categorías creciera mucho, se podría reconsiderar la paginación o agregación del reporte.
