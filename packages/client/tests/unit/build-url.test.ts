import { describe, expect, it } from "vitest";
import { buildUrl } from "../../src/core/build-url";

describe("buildUrl", () => {
  it("joins baseUrl and path", () => {
    expect(buildUrl("https://api.test.com", "/users")).toBe(
      "https://api.test.com/users"
    );
  });

  it("normalizes missing slash in path", () => {
    expect(buildUrl("https://api.test.com", "users")).toBe(
      "https://api.test.com/users"
    );
  });

  it("appends query params", () => {
    expect(
      buildUrl("https://api.test.com", "/users", {
        page: 1,
        active: true,
      })
    ).toBe("https://api.test.com/users?page=1&active=true");
  });

  it("ignores null and undefined query params", () => {
    expect(
      buildUrl("https://api.test.com", "/users", {
        page: 1,
        q: undefined,
        filter: null,
      })
    ).toBe("https://api.test.com/users?page=1");
  });
});
