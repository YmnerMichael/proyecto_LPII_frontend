# Matriz de pruebas de la venta — Sesión 9

Completa «Precondición», «Datos» y «Resultado obtenido» con tus datos reales; adjunta la captura de pantalla con el nombre indicado. No se han ejecutado ni se presuponen estos resultados.

| ID | Grupo | Precondición | Datos | Resultado esperado | Resultado obtenido | Estado (Pasa / Falla) | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-01 | Buscadores | Cliente inactivo y activo disponibles | DNI del inactivo; apellido del activo sin tilde | El inactivo no aparece («Ningún cliente activo coincide…»); el activo sí aparece. | Pendiente de ejecutar | Pendiente | `evidencias/B-01_spa.png` |
| B-02 | Buscadores | Productos activos con stock disponibles | Buscar por parte del nombre y por nombre de categoría; pulsar Enter | Coincidencias muestran precio y stock; Enter agrega el primer resultado sin abrir confirmación. | Pendiente de ejecutar | Pendiente | `evidencias/B-02_spa.png` |
| C-01 | Cálculos | Producto activo de S/ 12.50 | Precio S/ 12.50 × cantidad 3 | 12.50 × 3 = **S/ 37.50**; subtotal y total estimado S/ 37.50. | Pendiente de ejecutar | Pendiente | `evidencias/C-01_spa.png` |
| C-02 | Cálculos | Producto activo de S/ 18.90 | Precio S/ 18.90 × cantidad 3 | 18.90 × 3 = **S/ 56.70**, exactamente dos decimales. | Pendiente de ejecutar | Pendiente | `evidencias/C-02_spa.png` |
| C-03 | Cálculos | Tres productos distintos con precios conocidos | Agregar A, B y C; quitar B | Total nuevo = subtotal A + subtotal C; subtotal B deja de incluirse. Anotar ambas sumas manuales. | Pendiente de ejecutar | Pendiente | `evidencias/C-03_spa.png` |
| C-04 | Cálculos | Venta de C-03 confirmada | Comparar total estimado con total del comprobante | Total del servidor en comprobante = suma de subtotales aceptados en la venta. | Pendiente de ejecutar | Pendiente | `evidencias/C-04_spa.png` |
| V-01 | Validaciones | Formulario de venta nuevo | Pulsar «Revisar venta» sin cliente ni productos | Se muestran errores de cliente y detalle vacío; no aparece el resumen y no se envía POST. | Pendiente de ejecutar | Pendiente | `evidencias/V-01_spa.png` |
| V-02 | Validaciones | Producto agregado a la venta | Probar cantidad 0 y después 2.5 | Ambos valores muestran validación de cantidad entera mayor que cero; no se puede revisar. | Pendiente de ejecutar | Pendiente | `evidencias/V-02_spa.png` |
| V-03 | Validaciones | Producto con stock 2 | Ingresar cantidad 3 | La línea muestra «Supera el stock (2)» y se impide revisar/registrar. | Pendiente de ejecutar | Pendiente | `evidencias/V-03_spa.png` |
| V-04 | Validaciones | Producto agregado a la venta | Volver a agregar el mismo producto desde el buscador | Aparece «En la venta: n»; la cantidad aumenta en 1 y no se duplica la línea. | Pendiente de ejecutar | Pendiente | `evidencias/V-04_spa.png` |
| V-05 | Validaciones / API | Cliente y producto válidos; Postman configurado | POST con el mismo producto en dos líneas de cantidad 1 | Registrar la regla esperada (consolidar/rechazar/aceptar) y contrastarla con la respuesta real, stock y comprobante; no asumir resultado. | Pendiente de ejecutar | Pendiente | `evidencias/V-05_postman.png` |
| F-01 | Confirmación | Venta válida preparada | Revisar y pulsar «Volver» | Se cierra el resumen y la pestaña Network no muestra POST. | Pendiente de ejecutar | Pendiente | `evidencias/F-01_spa.png` |
| F-02 | Confirmación | Venta válida preparada; backend disponible | Pulsar «Confirmar venta» dos veces seguidas | El botón se deshabilita mientras registra y se crea una sola venta. | Pendiente de ejecutar | Pendiente | `evidencias/F-02_spa.png` |
| M-01 | Mensajes / concurrencia | Producto activo con stock 2; dos pestañas | Ambas preparan 2 unidades; confirmar primero en pestaña A y luego en B | La segunda recibe HTTP 409 con el mensaje de stock; puede corregir el formulario sin recargar. | Pendiente de ejecutar | Pendiente | `evidencias/M-01_postman.png` |
| M-02 | Mensajes / API | Cliente inactivo y producto activo disponibles | POST de venta con el ID del cliente inactivo | HTTP 409 y mensaje «No se puede registrar una venta para un cliente inactivo». | Pendiente de ejecutar | Pendiente | `evidencias/M-02_postman.png` |
| I-01 | Impresión | Venta registrada, anulada y resultados filtrados disponibles | Imprimir al registrar, comprobante anulado y consulta filtrada | Sin menú/botones; comprobante con DNI y pie; anulada con sello; consulta con resumen de filtros. Guardar cada vista previa. | Pendiente de ejecutar | Pendiente | `evidencias/I-01_comprobantes.png` |
| X-01 | Consistencia | Venta registrada en la SPA | Revisar stock de Productos y fila en consulta | Stock disminuye según las cantidades; número de venta, ítems y total corresponden al comprobante. | Pendiente de ejecutar | Pendiente | `evidencias/X-01_consistencia.png` |
| UX-01 | Usabilidad (propio) | Venta válida preparada en el resumen | Volver, corregir cantidad y volver a revisar | El cajero conserva la cabecera y líneas, el total se recalcula y puede confirmar sin rehacer la venta. | Pendiente de ejecutar | Pendiente | `evidencias/UX-01_spa.png` |
| API-01 | Contrato API (propio) | Postman; fechas conocidas con ventas | GET al reporte sin filtros y luego con `desde`/`hasta` | HTTP 200; respuesta es una lista con `categoriaId`, `categoriaNombre`, `cantidadVendida`, `montoTotal`; fechas restringen periodo. | Pendiente de ejecutar | Pendiente | `evidencias/API-01_postman.png` |
| R-01 | Reportes (propio) | Existen ventas registradas de más de una categoría | Abrir `/reportes/ventas-por-categoria` sin fechas | Aparecen categorías del histórico; unidades e importes corresponden a la respuesta del backend y barras comparan importes. | Pendiente de ejecutar | Pendiente | `evidencias/R-01_spa.png` |
| FCH-01 | Fechas (propio) | Reporte disponible | «Desde» posterior a «hasta» y luego un rango válido | Rango invertido se bloquea en SPA sin GET; el rango válido se envía y actualiza el reporte. | Pendiente de ejecutar | Pendiente | `evidencias/FCH-01_spa.png` |

## Resumen de ejecución

Completar después de ejecutar los casos:

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
| Usabilidad (propio) |  |  |  |
| Contrato API (propio) |  |  |  |
| Reportes (propio) |  |  |  |
| **Total** |  |  |  |
