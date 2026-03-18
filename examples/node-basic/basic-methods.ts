import { createClient } from '@dfsync/client';

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const client = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  retry: {
    attempts: 2,
  },
});

async function main(): Promise<void> {
  const posts = await client.get<Post[]>('/posts');

  console.log('Posts:', posts.slice(0, 2));

  const createdPost = await client.post<Post>('/posts', {
    title: 'Hello from dfsync',
    body: 'Created with @dfsync/client',
    userId: 1,
  });

  console.log('Created post:', createdPost);

  const patchedPost = await client.patch<Post>('/posts/1', {
    title: 'Updated with PATCH',
  });

  console.log('Patched post:', patchedPost);

  const deletedPost = await client.delete<undefined>('/posts/1');

  console.log('Delete response (demo API does not persist changes):', deletedPost);

  const singlePost = await client.request<Post>({
    method: 'GET',
    path: '/posts/1',
  });

  console.log('Single post via request():', singlePost);
}

main().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
