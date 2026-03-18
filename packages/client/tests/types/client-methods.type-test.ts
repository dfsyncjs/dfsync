import { createClient } from '../../src';

const client = createClient({
  baseUrl: 'https://api.test.com',
});

// allowed
client.get('/users');
client.delete('/users/1');

client.post('/users', { name: 'John' });
client.put('/users/1', { name: 'John' });
client.patch('/users/1', { name: 'Jane' });

client.get('/users', {
  headers: {
    authorization: 'Bearer token',
  },
});

client.post('/users', { name: 'John' }, { timeout: 5000 });

// body must not be allowed for GET
// @ts-expect-error body is not allowed in GET options
client.get('/users', { body: { invalid: true } });

// body must not be allowed for DELETE
// @ts-expect-error body is not allowed in DELETE options
client.delete('/users/1', { body: { invalid: true } });

// body must not be allowed in options for POST
// @ts-expect-error body must be passed as the second argument, not in options
client.post('/users', { name: 'John' }, { body: { invalid: true } });

// body must not be allowed in options for PUT
// @ts-expect-error body must be passed as the second argument, not in options
client.put('/users/1', { name: 'John' }, { body: { invalid: true } });

// body must not be allowed in options for PATCH
// @ts-expect-error body must be passed as the second argument, not in options
client.patch('/users/1', { name: 'Jane' }, { body: { invalid: true } });
