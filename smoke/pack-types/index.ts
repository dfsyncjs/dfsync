import { createClient, HttpError, NetworkError, TimeoutError } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  fetch: async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
});

async function run() {
  const result = await client.get<{ ok: boolean }>('/health');

  const ok: boolean = result.ok;
  void ok;

  try {
    await client.post('/users', { name: 'Roman' });
  } catch (error) {
    if (error instanceof HttpError) {
      const status: number = error.status;
      void status;
    }

    if (error instanceof TimeoutError) {
      const timeout: number = error.timeout;
      void timeout;
    }

    if (error instanceof NetworkError) {
      const code: string = error.code;
      void code;
    }
  }
}

void run();
