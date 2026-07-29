import { describe, expect, it } from 'vitest';

import { DfsyncError, ParseError } from '../../src';

describe('ParseError', () => {
  it('extends DfsyncError and exposes the parse error code', () => {
    const response = new Response('not json', { status: 200 });
    const error = new ParseError(response);

    expect(error).toBeInstanceOf(DfsyncError);
    expect(error).toBeInstanceOf(ParseError);
    expect(error.name).toBe('ParseError');
    expect(error.code).toBe('PARSE_ERROR');
    expect(error.message).toBe('Response parsing failed');
  });

  it('exposes the original response', () => {
    const response = new Response('not json', { status: 200, statusText: 'OK' });
    const error = new ParseError(response);

    expect(error.response).toBe(response);
    expect(error.response.status).toBe(200);
  });

  it('preserves the underlying cause', () => {
    const cause = new SyntaxError('Unexpected token');
    const error = new ParseError(new Response('not json'), cause);

    expect(error.cause).toBe(cause);
  });

  it('leaves the cause undefined when none is provided', () => {
    const error = new ParseError(new Response('not json'));

    expect(error.cause).toBeUndefined();
  });
});
