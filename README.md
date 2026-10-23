# PharmaFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Ventas

El módulo `/ventas` registra ventas con un detalle dinámico, confirma la operación antes del POST y muestra un comprobante basado en la respuesta del backend. Incluye consulta paginada por cliente, estado y fechas e impresión de comprobantes.

El módulo `/reportes/ventas-por-categoria` consume el reporte agregado del backend, acepta fechas opcionales y compara el monto vendido por categoría.

## Seguridad

El acceso inicia en `/login` y consume `POST /api/v1/auth/login`. La SPA conserva en `sessionStorage` el token y los datos de sesión hasta su vencimiento; los interceptores agregan el token solo a las llamadas de la API y regresan al login ante un `401`. Las rutas, opciones del menú y acciones de escritura se filtran por los permisos recibidos del backend. Un `403` conserva la sesión y muestra la página de acceso denegado.

El vendedor puede consultar categorías y productos y registrar/consultar ventas; puede leer clientes para completar una venta, pero no administrar clientes ni editar el catálogo. El almacenero puede consultar y mantener categorías y productos, y consultar ventas sin registrarlas. Solo `ADMIN` recibe todos los permisos, incluidos clientes, reportes y administración de usuarios.

El frontend permite al rol `ALMACENERO` consultar ventas sin recibir permisos de escritura. El backend también debe autorizar `VENTAS_LEER` para ese rol para que las consultas y detalles de ventas se completen; los guards y controles visuales del frontend no sustituyen esa autorización.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
