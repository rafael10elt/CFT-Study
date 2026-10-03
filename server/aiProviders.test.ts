import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chatWithFreeProviders,
  chatWithGemini,
  chatWithOllama,
} from "./aiProviders";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const geminiPayload = {
  candidates: [{ content: { parts: [{ text: "Resposta Gemini" }] } }],
};
const ollamaPayload = { message: { role: "assistant", content: "Resposta Ollama" } };

function mockFetchOnce(handler: (url: string, init: unknown) => unknown) {
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

describe("chatWithGemini", () => {
  it("retorna null sem chave, sem chamar a rede", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const calls = mockFetchOnce(async () => okJson(geminiPayload));
    expect(await chatWithGemini("sys", [{ role: "user", content: "oi" }])).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it("mapeia assistant→model e extrai o texto", async () => {
    const calls = mockFetchOnce(async () => okJson(geminiPayload));
    const text = await chatWithGemini(
      "sys",
      [
        { role: "user", content: "q" },
        { role: "assistant", content: "a" },
      ],
      "key-test"
    );
    expect(text).toBe("Resposta Gemini");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("generativelanguage.googleapis.com");
    const body = JSON.parse((calls[0].init as { body: string }).body) as {
      contents: Array<{ role: string }>;
    };
    expect(body.contents.map(item => item.role)).toEqual(["user", "model"]);
  });

  it("tenta o segundo modelo após 404", async () => {
    const calls = mockFetchOnce(async (url: string) =>
      url.includes("gemini-2.5-flash")
        ? ({ ok: false, status: 404, json: async () => ({}) }) as Response
        : okJson(geminiPayload)
    );
    const text = await chatWithGemini("sys", [{ role: "user", content: "q" }], "k");
    expect(text).toBe("Resposta Gemini");
    expect(calls).toHaveLength(2);
  });
});

describe("chatWithOllama", () => {
  it("envia system+histórico e extrai content", async () => {
    const calls = mockFetchOnce(async () => okJson(ollamaPayload));
    const text = await chatWithOllama(
      "sys",
      [{ role: "user", content: "q" }],
      "http://127.0.0.1:11434",
      "llama3.1:8b"
    );
    expect(text).toBe("Resposta Ollama");
    const body = JSON.parse((calls[0].init as { body: string }).body) as {
      model: string;
      messages: Array<{ role: string }>;
    };
    expect(body.model).toBe("llama3.1:8b");
    expect(body.messages[0]).toMatchObject({ role: "system", content: "sys" });
  });

  it("retorna null quando o Ollama está fora do ar", async () => {
    mockFetchOnce(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect(
      await chatWithOllama("sys", [{ role: "user", content: "q" }])
    ).toBeNull();
  });
});

describe("chatWithFreeProviders", () => {
  it("prefere Gemini e nem tenta Ollama", async () => {
    vi.stubEnv("GEMINI_API_KEY", "k");
    const calls = mockFetchOnce(async () => okJson(geminiPayload));
    const result = await chatWithFreeProviders("sys", [
      { role: "user", content: "q" },
    ]);
    expect(result).toEqual({ text: "Resposta Gemini", provider: "gemini" });
    expect(calls).toHaveLength(1);
  });

  it("usa Ollama quando Gemini falha e retorna null sem nenhum", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    mockFetchOnce(async (url: string) =>
      url.includes("localhost") || url.includes("127.0.0.1")
        ? okJson(ollamaPayload)
        : okJson({ candidates: [] })
    );
    const result = await chatWithFreeProviders("sys", [
      { role: "user", content: "q" },
    ]);
    expect(result).toEqual({ text: "Resposta Ollama", provider: "ollama" });

    mockFetchOnce(async () => {
      throw new Error("down");
    });
    expect(
      await chatWithFreeProviders("sys", [{ role: "user", content: "q" }])
    ).toBeNull();
  });
});
