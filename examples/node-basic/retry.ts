import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  retry: {
    attempts: 2,
    backoff: 'exponential',
    baseDelayMs: 300,
  },
});

async function main() {
  try {
    const posts = await client.get('/posts/1');

    console.log('Post:', posts);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

main();
