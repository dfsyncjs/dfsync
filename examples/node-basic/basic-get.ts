import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});

const main = async (): Promise<void> => {
  const post = await client.get('/posts/1');
  console.log(post);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
