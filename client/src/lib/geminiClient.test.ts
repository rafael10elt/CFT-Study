import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chatWithGeminiBrowser,
  clearStoredGeminiKey,
  GeminiKeyError,
  getStoredGeminiKey,
  probeGeminiKey,
  setStoredGeminiKey,
} from "./geminiClient";

afterEach(() => {
  vi.unstubAllGlobals();
  clearStoredGeminiKey();
});

function mockFetch(handler: (url: string) => unknown) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      return handler(url);
    })
  );
  return calls;
}

const okJson = (payload: unknown) =>
  ({ ok: true, status: 200, json: async () => payload }) as Response;
const errJson = (status: number, payload: unknown) =>
  ({ ok: false, status, json: async () => payload }) as Response;

describe("geminiClient", () => {
  it("faz probe com sucesso e identifica o modelo", async () => {
    mockFetch(async () =>
      okJson({ candidates: [{ content: { parts: [{ text: "OK" }] } }] })
    );
    const result = await probeGeminiKey("key-test");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model).toBe("gemini-2.5-flash");
  });

  it("traduz chave inválida (400) em mensagem clara", async () => {
    mockFetch(async () =>
      errJson(400, { error: { message: "API key not valid. Please pass a valid API key." } })
    );
    const result = await probeGeminiKey("key-ruim");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/inválida/i);
  });

  it("traduz cota esgotada (429)", async () => {
    mockFetch(async () => errJson(429, { error: { message: "Quota exceeded" } }));
    const result = await probeGeminiKey("key-test");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/cota/i);
  });

  it("tenta o segundo modelo após 404", async () => {
    const calls = mockFetch(async (url: string) =>
      url.includes("gemini-2.5-flash")
        ? errJson(404, {})
        : okJson({ candidates: [{ content: { parts: [{ text: "texto" }] } }] })
    );
    const result = await chatWithGeminiBrowser("sys", [{ role: "user", content: "q" }], "k");
    expect(result).toEqual({ text: "texto", model: "gemini-3.5-flash-lite" });
    expect(calls).toHaveLength(2);
  });

  it("falha de rede vira erro amigável", async () => {
    mockFetch(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(
      chatWithGeminiBrowser("sys", [{ role: "user", content: "q" }], "k")
    ).rejects.toMatchObject({ code: "network" });
    await expect(
      chatWithGeminiBrowser("sys", [{ role: "user", content: "q" }], "k")
    ).rejects.toBeInstanceOf(GeminiKeyError);
  });

  it("chave vazia nem chega à rede", async () => {
    const calls = mockFetch(async () => okJson({}));
    await expect(chatWithGeminiBrowser("sys", [], "   ")).rejects.toMatchObject({
      code: "invalid-key",
    });
    expect(calls).toHaveLength(0);
  });

  it("armazenamento local guarda e remove a chave", () => {
    const memory = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => void memory.set(key, value),
        removeItem: (key: string) => void memory.delete(key),
      },
    });
    expect(getStoredGeminiKey()).toBe("");
    setStoredGeminiKey("  abc123  ");
    expect(getStoredGeminiKey()).toBe("abc123");
    clearStoredGeminiKey();
    expect(getStoredGeminiKey()).toBe("");
  });

  it("sem window, o armazenamento responde vazio sem quebrar", () => {
    expect(getStoredGeminiKey()).toBe("");
    expect(() => setStoredGeminiKey("x")).not.toThrow();
    expect(() => clearStoredGeminiKey()).not.toThrow();
  });
});
