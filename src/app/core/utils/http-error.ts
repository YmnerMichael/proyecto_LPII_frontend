import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeError(err: HttpErrorResponse | Error): string {
  if (err instanceof Error && !(err instanceof HttpErrorResponse)) {
    return err.message;
  }

  if (err.status === 0) {
    return 'No se pudo conectar con el servidor backend.';
  }
  const e = err.error;
  if (e?.message) {
    return e.message;
  }
  if (err.status === 400) return 'Solicitud incorrecta (Error 400).';
  if (err.status === 404) return 'Recurso no encontrado (Error 404).';
  if (err.status === 409) return 'Conflicto de datos / Nombre duplicado (Error 409).';
  return `Error inesperado (${err.status}).`;
}