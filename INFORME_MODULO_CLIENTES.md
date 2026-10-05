# Informe del módulo Clientes

## Objetivo

El módulo Clientes permite consultar, buscar, registrar, editar y eliminar clientes mediante la API REST del backend.

## Módulos y responsabilidades

| Elemento | Responsabilidad |
| --- | --- |
| `features/clientes/models/cliente.model.ts` | Define los datos de solicitud y respuesta usados por el frontend. |
| `features/clientes/services/cliente.service.ts` | Centraliza las llamadas HTTP CRUD al endpoint `/api/v1/clientes`. |
| `features/clientes/pages/cliente-list` | Lista y filtra clientes; permite navegar a edición y solicitar eliminación. |
| `features/clientes/pages/cliente-form` | Valida y envía los datos para crear o actualizar un cliente. |
| `features/clientes/clientes.routes.ts` | Declara las rutas internas del módulo. |
| `core/config/menu.ts` | Registra el acceso al módulo en la navegación principal. |
| `app.routes.ts` | Carga de forma diferida las rutas del módulo bajo `/clientes`. |

## Rutas

| Ruta | Responsabilidad |
| --- | --- |
| `/clientes` | Listado y búsqueda de clientes. |
| `/clientes/nuevo` | Formulario para crear un cliente. |
| `/clientes/:id/editar` | Formulario para consultar y actualizar un cliente existente. |

## Menú

El menú principal incluye la opción **Clientes**, que dirige a `/clientes`.

## Contrato con el backend

El servicio utiliza la URL base configurada en `environment.apiUrl` y añade `/clientes`:

| Método | Endpoint | Operación |
| --- | --- | --- |
| `GET` | `/api/v1/clientes` | Lista clientes. |
| `GET` | `/api/v1/clientes/{id}` | Consulta un cliente. |
| `POST` | `/api/v1/clientes` | Registra un cliente. |
| `PUT` | `/api/v1/clientes/{id}` | Actualiza un cliente. |
| `DELETE` | `/api/v1/clientes/{id}` | Elimina un cliente. |

El formulario aplica las validaciones definidas por `ClienteRequestDTO`: DNI de 8 dígitos, nombres y apellidos de 2 a 100 caracteres, correo obligatorio válido de hasta 150 caracteres, teléfono opcional de 9 dígitos, dirección de hasta 250 caracteres y estado obligatorio.