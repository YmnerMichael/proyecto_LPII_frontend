# Informe del módulo Productos

## Objetivo

El módulo Productos permite listar, ordenar y paginar productos en el frontend, consultar y guardar sus datos, y relacionar cada producto con una categoría existente.

## Rutas

| Ruta | Responsabilidad |
| --- | --- |
| `/productos` | Listado paginado, ordenamiento y filtro por categoría en la página actual. |
| `/productos/nuevo` | Registro de producto con selección de categoría activa. |
| `/productos/:id/editar` | Consulta y actualización de un producto. |

El acceso al módulo se carga de forma diferida desde `app.routes.ts` y aparece en el menú principal.

## Validaciones del formulario

| Campo | Regla |
| --- | --- |
| Nombre | Obligatorio, entre 3 y 100 caracteres. |
| Descripción | Opcional, hasta 200 caracteres. |
| Precio | Obligatorio, mínimo S/ 0.01. |
| Stock | Obligatorio, entero mayor o igual a 0. |
| Estado | Obligatorio. |
| Categoría | Obligatoria y debe corresponder a una categoría existente. |

El selector ofrece categorías activas. Al editar, también conserva la categoría original si está inactiva; en ese caso, no permite enviar el formulario hasta elegir una categoría activa. Los errores de duplicidad y de dependencias se muestran con el mensaje enviado por el backend.

## Contrato esperado con el backend

La URL base se toma de `environment.apiUrl`; el servicio añade `/productos`.

| Método | Endpoint | Operación |
| --- | --- | --- |
| `GET` | `/api/v1/productos` | Devuelve la lista completa de productos (`Iterable<ProductoResponseDTO>`). |
| `GET` | `/api/v1/productos/{id}` | Consulta un producto. |
| `POST` | `/api/v1/productos` | Registra un producto. |
| `PUT` | `/api/v1/productos/{id}` | Actualiza un producto. |
| `DELETE` | `/api/v1/productos/{id}` | Da de baja un producto. |

El cuerpo de creación y actualización contiene `nombre`, `descripcion`, `precio`, `stock`, `estado` y `categoriaId`. Cada producto de respuesta incluye `id`, `nombre`, `descripcion`, `precio`, `stock`, `estado`, `categoriaId`, `categoriaNombre`, `fechaCreacion` y `fechaModificacion`. El frontend ordena, filtra y pagina esta lista en el cliente porque el controlador no declara paginación ni parámetros de ordenamiento.

El listado y el formulario obtienen las categorías desde `/api/v1/categorias`. El backend permite solicitudes CORS desde `http://localhost:4200`; para desarrollo, abre el frontend en ese host y puerto (no `127.0.0.1`) o agrega el origen usado a `@CrossOrigin`.
