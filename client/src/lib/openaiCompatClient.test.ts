import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chatWithCompatBrowser,
  clearStoredCompatConfig,
  CompatKeyError,
  getStoredCompatConfig,
  probeCompatConfig,
  setStoredCompatConfig,
} from "./openaiCompatClient";

afterEach(() => {
  vi.unstubAllGlobals();
  clearStoredCompatConfig();
});

function mockFetch(handler: (url: string, init: unknown) => unknown) {
  const calls: Array<{ url: string; init: unknown }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: unknown) => {
      calls.push({ url, init });
      return handler(url, init);
    })
  );
  return calls;
}

const okJson = (payload: unknown) =>
  ({ ok: true, status: 200, json: async () => payload }) as Response;
const errJson = (status: number, payload: unknown) =>
  ({ ok: false, status, json: async () => payload }) as Response;
const compatOk = {
  choices: [{ message: { role: "assistant", content: "texto-compat" } }],
};
const config = { baseUrl: "https://api.deepseek.com", model: "deepseek-chat", apiKey: "sk-test" };

describe("openaiCompatClient", () => {
  it("chama /chat/completions com Bearer e extrai o texto", async () => {
    const calls = mockFetch(async () => okJson(compatOk));
    const result = await chatWithCompatBrowser("sys", [{ role: "user", content: "q" }], config);
    expect(result).toEqual({ text: "texto-compat", model: "deepseek-chat" });
    expect(calls[0].url).toBe("https://api.deepseek.com/chat/completions");
    const body = JSON.parse((calls[0].init as { body: string }).body) as {
      model: string;
      messages: Array<{ role: string }>;
    };
    expect(body.model).toBe("deepseek-chat");
    expect(body.messages[0]).toMatchObject({ role: "system" });
  });

  it("401 vira chave inválida e 402 vira saldo insuficiente", async () => {
    mockFetch(async () => errJson(401, { error: { message: "invalid key" } }));
    await expect(chatWithCompatBrowser("sys", [], config)).rejects.toMatchObject({
      code: "invalid-key",
    });
    mockFetch(async () => errJson(402, { error: { message: "Insufficient Balance" } }));
    const probe = await probeCompatConfig(config);
    expect(probe.ok).toBe(false);
    if (!probe.ok) expect(probe.error).toMatch(/saldo/i);
  });

  it("probe com sucesso informa modelo e tempo", async () => {
    mockFetch(async () => okJson(compatOk));
    const probe = await probeCompatConfig(config);
    expect(probe.ok).toBe(true);
    if (probe.ok) expect(probe.model).toBe("deepseek-chat");
  });

  it("config vazia nem chega à rede", async () => {
    const calls = mockFetch(async () => okJson(compatOk));
    await expect(
      chatWithCompatBrowser("sys", [], { baseUrl: "", model: "", apiKey: "" })
    ).rejects.toBeInstanceOf(CompatKeyError);
    expect(calls).toHaveLength(0);
  });

  it("armazenamento guarda e remove a config", () => {
    const memory = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => void memory.set(key, value),
        removeItem: (key: string) => void memory.delete(key),
      },
    });
    expect(getStoredCompatConfig()).toEqual({ baseUrl: "", model: "", apiKey: "" });
    setStoredCompatConfig({ baseUrl: "https://x/", model: " m ", apiKey: " k " });
    expect(getStoredCompatConfig()).toEqual({ baseUrl: "https://x", model: "m", apiKey: "k" });
    clearStoredCompatConfig();
    expect(getStoredCompatConfig()).toEqual({ baseUrl: "", model: "", apiKey: "" });
  });
});
