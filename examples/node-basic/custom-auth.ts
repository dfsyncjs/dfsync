import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  auth: {
    type: 'custom',
    apply: ({ headers, url }) => {
      headers['x-service-name'] = 'node-basic-example';
      url.searchParams.set('tenant', 'demo');
    },
  },
});

const main = async (): Promise<void> => {
  const result = await client.get('/posts/1');
  console.log(result);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
