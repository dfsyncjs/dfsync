import { createClient, ParseError } from '@dfsync/client';

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
    // A parser that throws produces a `ParseError` instead of being reported as a
    // transport failure, so it is never retried. This parser falls back to plain
    // text, so the branch is only reached if parsing fails for another reason.
    if (error instanceof ParseError) {
      console.error('Could not parse response body:', error.response.status, error.cause);
      return;
    }

    console.error('Request failed:', error);
  }
}

main();
