import { describe, expect, it } from 'vitest';
import { redondear } from './numeros';

describe('redondear', () => {
  it('rounds currency values to two decimal places', () => {
    expect(redondear(37.499999)).toBe(37.5);
    expect(redondear(1.005)).toBe(1.01);
    expect(redondear(4)).toBe(4);
  });
});
