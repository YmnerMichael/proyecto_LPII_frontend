import { describe, expect, it } from 'vitest';
import { coincide, normalizar } from './texto';

describe('texto search helpers', () => {
  it('normalizes case, accents, and surrounding whitespace', () => {
    expect(normalizar('  Huamán  ')).toBe('huaman');
  });

  it('requires every search term to appear across searchable fields', () => {
    expect(coincide('huaman 123', 'María', 'Huamán Pérez', '12345678')).toBe(true);
    expect(coincide('para 500', 'Paracetamol 500 mg', 'Analgésicos')).toBe(true);
    expect(coincide('no existe', 'Paracetamol 500 mg')).toBe(false);
    expect(coincide('  ', 'cualquier campo')).toBe(false);
  });
});
