import { describe, expect, it } from 'vitest';

import { ValidationError } from '../../src/errors/validation-error';

describe('ValidationError', () => {
  it('stores response and data', () => {
    const data = { message: 'invalid payload' };
    const response = new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
    });

    const error = new ValidationError(response, data);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Response validation failed');
    expect(error.response).toBe(response);
    expect(error.data).toBe(data);
  });
});
