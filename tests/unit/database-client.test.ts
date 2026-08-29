import { afterEach, describe, expect, it } from "vitest";
import { createDatabaseClient } from "@/lib/database/client";

const URL_KEY = "NEXT_PUBLIC_DATABASE_URL";
const ANON_KEY = "NEXT_PUBLIC_DATABASE_ANON_KEY";

afterEach(() => {
  delete process.env[URL_KEY];
  delete process.env[ANON_KEY];
});

describe("createDatabaseClient", () => {
  it("returns null when credentials are missing", () => {
    // Arrange
    delete process.env[URL_KEY];
    delete process.env[ANON_KEY];

    // Act
    const client = createDatabaseClient();

    // Assert
    expect(client).toBeNull();
  });

  it("returns a client with a from() contract when credentials exist", () => {
    // Arrange
    process.env[URL_KEY] = "https://example.invalid";
    process.env[ANON_KEY] = "anon-key";

    // Act
    const client = createDatabaseClient();

    // Assert
    expect(client).not.toBeNull();
    expect(typeof client?.from).toBe("function");
  });
});
