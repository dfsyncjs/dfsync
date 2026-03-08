import { describe, expect, it, vi } from "vitest";
import { createClient } from "../../src/core/create-client";

describe("client.get", () => {
  it("performs GET request and returns parsed json", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ id: "1", name: "Roman" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    });

    const client = createClient({
      baseUrl: "https://api.test.com",
      fetch: fetchMock,
    });

    const result = await client.get<{ id: string; name: string }>("/users/1");

    expect(result).toEqual({
      id: "1",
      name: "Roman",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test.com/users/1",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });
});
