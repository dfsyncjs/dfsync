import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  hooks: {
    beforeRequest: ({ headers, url }) => {
      headers['x-request-id'] = crypto.randomUUID();
      console.log('Request:', url.toString());
    },
    afterResponse: ({ response }) => {
      console.log('Response status:', response.status);
    },
    onError: ({ error }) => {
      console.error('Request failed:', error);
    },
  },
});

const main = async (): Promise<void> => {
  const post = await client.get('/posts/1');
  console.log(post);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
