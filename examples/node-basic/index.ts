import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});

async function main() {
  const users = await client.get('/users');

  console.log('Users:');
  console.log(users);
}

main();
