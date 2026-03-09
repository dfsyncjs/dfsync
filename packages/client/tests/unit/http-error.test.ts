import { describe, expect, it } from 'vitest';
import { DfsyncError } from '../../src/errors/base-error';
import { HttpError } from '../../src/errors/http-error';

describe('HttpError', () => {
  it('sets response metadata and data', () => {
    const response = new Response(JSON.stringify({ message: 'Bad request' }), {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'content-type': 'application/json' },
    });

    const error = new HttpError(response, { message: 'Bad request' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DfsyncError);
    expect(error.name).toBe('HttpError');
    expect(error.code).toBe('HTTP_ERROR');
    expect(error.message).toBe('HTTP 400 Bad Request');
    expect(error.status).toBe(400);
    expect(error.statusText).toBe('Bad Request');
    expect(error.data).toEqual({ message: 'Bad request' });
    expect(error.response).toBe(response);
  });
});
