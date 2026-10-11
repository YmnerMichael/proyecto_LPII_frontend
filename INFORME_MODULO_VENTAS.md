# Informe del módulo Ventas

## Funcionalidad

El módulo está disponible en `/ventas` y contiene:

| Ruta | Responsabilidad |
| --- | --- |
| `/ventas` | Consulta paginada con filtros de cliente, estado y fechas; impresión del listado. |
| `/ventas/nueva` | Formulario cabecera–detalle para armar, revisar y confirmar una venta. |
| `/ventas/reporte-categorias` | Resumen de unidades, ventas e importes por categoría. |
| `/ventas/:id` | Comprobante con importes devueltos por el servidor e impresión opcional. |

## Registro

El formulario carga clientes y productos desde los servicios existentes, excluye clientes inactivos y productos inactivos o sin stock, y permite encontrarlos sin distinguir mayúsculas ni tildes. Las líneas se agregan desde el buscador, se pueden quitar y no se repiten: agregar otra vez un producto aumenta su cantidad. Los subtotales y el total se recalculan con señales y se redondean a dos decimales.

Antes de llamar a `POST /api/v1/ventas`, se valida cliente, detalle no vacío, cantidades enteras positivas y stock disponible. La pantalla de revisión requiere confirmación explícita. El request solo envía `clienteId`, `productoId` y `cantidad`; los errores HTTP se muestran mediante el mensaje común de la aplicación.

## Consulta y comprobante

La búsqueda usa `GET /api/v1/ventas/buscar`, pagina los resultados y solo envía los filtros seleccionados. Se impide consultar si la fecha inicial es posterior a la final. El comprobante consulta la venta por identificador y presenta el total definitivo del servidor; el DNI se carga aparte y su fallo no impide mostrar el comprobante. La impresión oculta controles y navegación.

## Reporte por categoría

El reporte recorre todas las páginas de ventas registradas del periodo y suma cantidades y subtotales por categoría. La respuesta de venta descrita en la guía no incluye la categoría histórica de cada línea, por lo que el agrupamiento utiliza la categoría actual del producto; si el producto ya no está en el catálogo, se muestra como «Categoría no disponible».

## Contrato esperado

| Método | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/api/v1/ventas` | Registrar cliente y líneas con productos/cantidades. |
| `GET` | `/api/v1/ventas/{id}` | Cargar comprobante. |
| `GET` | `/api/v1/ventas/buscar` | Consultar y generar el reporte por periodo. |

La consulta presupone una respuesta paginada con `contenido`, `pagina`, `totalPaginas`, `totalElementos` y `ultima`, tal como los ejemplos de la guía.
