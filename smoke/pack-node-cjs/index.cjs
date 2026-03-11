const { createClient } = require('@dfsync/client');

if (typeof createClient !== 'function') {
  throw new Error('Expected createClient to be a function');
}

const client = createClient({
  baseUrl: 'https://api.example.com',
  fetch: async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
});

client
  .get('/health')
  .then((result) => {
    if (!result || result.ok !== true) {
      throw new Error('Expected client.get() to return { ok: true }');
    }

    console.log('CJS pack smoke test passed');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
