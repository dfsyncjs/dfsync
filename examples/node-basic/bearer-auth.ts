import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  auth: {
    type: 'bearer',
    token: async () => process.env.API_TOKEN ?? 'demo-token',
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
