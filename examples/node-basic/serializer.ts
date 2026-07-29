import { createClient } from '@dfsync/client';

// A client that sends form-encoded bodies and parses form-encoded responses,
// instead of the default JSON behavior.
const client = createClient({
  baseUrl: 'https://httpbin.org',
  serializeBody(body) {
    return {
      body: new URLSearchParams(body as Record<string, string>).toString(),
      contentType: 'application/x-www-form-urlencoded',
    };
  },
  async parseResponse(response) {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
});

async function main() {
  try {
    const result = await client.post('/post', { name: 'Roman', role: 'backend' });

    console.log('Response:', result);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

main();
