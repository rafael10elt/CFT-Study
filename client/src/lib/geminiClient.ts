/**
 * Chamada direta ao Google Gemini a partir do navegador.
 *
 * Usada quando o app roda sem backend (ex.: Netlify estático) e o estudante
 * informou a própria chave em Configurações. A chave fica SOMENTE neste
 * navegador (localStorage separado — nunca entra no backup JSON exportado).
 *
 * Segurança: restrinja a chave no AI Studio por referenciador HTTP ao seu
 * domínio, para que ela não possa ser reutilizada em outros sites.
 */

export const GEMINI_STORAGE_KEY = "cft-study-companion:gemini-key";

export const GEMINI_BROWSER_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
];

export interface BrowserChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class GeminiKeyError extends Error {
  code:
    | "invalid-key"
    | "forbidden"
    | "quota"
    | "model"
    | "network"
    | "empty"
    | "unknown";
  httpStatus?: number;
  constructor(code: GeminiKeyError["code"], message: string, httpStatus?: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function storage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredGeminiKey(): string {
  return storage()?.getItem(GEMINI_STORAGE_KEY) ?? "";
}

export function setStoredGeminiKey(key: string): void {
  storage()?.setItem(GEMINI_STORAGE_KEY, key.trim());
}

export function clearStoredGeminiKey(): void {
  storage()?.removeItem(GEMINI_STORAGE_KEY);
}

export function hasStoredGeminiKey(): boolean {
  return getStoredGeminiKey().length > 0;
}

function friendlyError(status: number, detail: string): GeminiKeyError {
  if (status === 400 && /api key not valid|api_key_invalid|invalid/i.test(detail))
    return new GeminiKeyError(
      "invalid-key",
      "Chave inválida ou bloqueada (erro 400). Confira se copiou a chave completa em Configurações ou gere uma nova no AI Studio.",
      status
    );
  if (status === 403)
    return new GeminiKeyError(
      "forbidden",
      "Chave recusada (erro 403). Verifique restrições de referenciador/API no AI Studio ou gere uma nova chave.",
      status
    );
  if (status === 429)
    return new GeminiKeyError(
      "quota",
      "Cota gratuita esgotada ou limite de ritmo atingido (erro 429). Aguarde alguns minutos e tente de novo.",
      status
    );
  return new GeminiKeyError(
    "unknown",
    `Gemini respondeu com erro ${status}. ${detail.slice(0, 160)}`,
    status
  );
}

function extractText(payload: unknown): string | null {
  const candidates = (payload as { candidates?: unknown })?.candidates;
  if (!Array.isArray(candidates) || !candidates.length) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } })?.content
    ?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .filter(
      (part): part is { text: string } =>
        !!part &&
        typeof part === "object" &&
        typeof (part as { text?: unknown }).text === "string"
    )
    .map(part => part.text)
    .join("\n")
    .trim();
  return text || null;
}

export async function chatWithGeminiBrowser(
  systemPrompt: string,
  messages: BrowserChatMessage[],
  apiKey: string,
  maxOutputTokens = 750
): Promise<{ text: string; model: string }> {
  const key = apiKey.trim();
  if (!key) throw new GeminiKeyError("invalid-key", "Nenhuma chave informada.");
  let lastError: GeminiKeyError | null = null;
  for (const model of GEMINI_BROWSER_MODELS) {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: messages.map(message => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: message.content }],
            })),
            generationConfig: { maxOutputTokens, temperature: 0.4 },
          }),
        }
      );
    } catch {
      throw new GeminiKeyError(
        "network",
        "Sem conexão com o Google (falha de rede). Verifique sua internet e tente de novo."
      );
    }
    if (response.status === 404) {
      lastError = new GeminiKeyError(
        "model",
        `Modelo ${model} indisponível (404). Tentando alternativa…`,
        404
      );
      continue;
    }
    if (!response.ok) {
      let detail = "";
      try {
        detail = JSON.stringify(await response.json()).slice(0, 300);
      } catch {
        detail = response.statusText;
      }
      throw friendlyError(response.status, detail);
    }
    const text = extractText(await response.json());
    if (!text)
      throw new GeminiKeyError(
        "empty",
        "Gemini respondeu vazio. Tente reformular a pergunta."
      );
    return { text, model };
  }
  throw (
    lastError ??
    new GeminiKeyError("model", "Nenhum modelo Gemini disponível agora.")
  );
}

/** Testa a chave com uma pergunta mínima. Não salva nada. */
export async function probeGeminiKey(
  apiKey: string
): Promise<{ ok: true; model: string; ms: number } | { ok: false; error: string }> {
  const started = Date.now();
  try {
    const result = await chatWithGeminiBrowser(
      "Responda sempre com exatamente: OK",
      [{ role: "user", content: "Teste de conexão. Responda exatamente: OK" }],
      apiKey,
      20
    );
    void result.text;
    return { ok: true, model: result.model, ms: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof GeminiKeyError
          ? error.message
          : "Falha desconhecida ao testar a chave.",
    };
  }
}
