/**
 * Chamada direta a APIs estilo OpenAI (/chat/completions) a partir do
 * navegador: DeepSeek, OpenAI e qualquer endpoint compatível.
 *
 * Como o Gemini, vale também no site estático (Netlify). Base URL, modelo
 * e chave ficam SOMENTE neste navegador (localStorage separado — nunca
 * entram no backup JSON exportado).
 */

export const COMPAT_STORAGE_KEY = "cft-study-companion:compat-config";

export interface CompatConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export const COMPAT_PRESETS: Record<string, { label: string; baseUrl: string; model: string }> = {
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
};

export interface BrowserChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class CompatKeyError extends Error {
  code: "invalid-key" | "balance" | "quota" | "model" | "network" | "empty" | "unknown" | "config";
  httpStatus?: number;
  constructor(code: CompatKeyError["code"], message: string, httpStatus?: number) {
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

export function getStoredCompatConfig(): CompatConfig {
  try {
    const raw = storage()?.getItem(COMPAT_STORAGE_KEY);
    if (!raw) return { baseUrl: "", model: "", apiKey: "" };
    const parsed = JSON.parse(raw) as Partial<CompatConfig>;
    return {
      baseUrl: String(parsed.baseUrl ?? ""),
      model: String(parsed.model ?? ""),
      apiKey: String(parsed.apiKey ?? ""),
    };
  } catch {
    return { baseUrl: "", model: "", apiKey: "" };
  }
}

export function setStoredCompatConfig(config: CompatConfig): void {
  storage()?.setItem(
    COMPAT_STORAGE_KEY,
    JSON.stringify({
      baseUrl: config.baseUrl.trim().replace(/\/+$/, ""),
      model: config.model.trim(),
      apiKey: config.apiKey.trim(),
    })
  );
}

export function clearStoredCompatConfig(): void {
  storage()?.removeItem(COMPAT_STORAGE_KEY);
}

export function hasStoredCompatKey(): boolean {
  const config = getStoredCompatConfig();
  return config.baseUrl.length > 0 && config.apiKey.length > 0;
}

function friendlyError(status: number, detail: string): CompatKeyError {
  if (status === 401)
    return new CompatKeyError(
      "invalid-key",
      "Chave inválida ou sem permissão (erro 401). Confira a chave e se ela pertence a esta API.",
      status
    );
  if (status === 402)
    return new CompatKeyError(
      "balance",
      "Saldo insuficiente (erro 402). Recarregue créditos na conta da API.",
      status
    );
  if (status === 429)
    return new CompatKeyError(
      "quota",
      "Limite de uso atingido (erro 429). Aguarde alguns minutos ou verifique a cota do seu plano.",
      status
    );
  if (status === 404)
    return new CompatKeyError(
      "model",
      `Modelo ou endereço não encontrado (erro 404). Confira base URL e nome do modelo. Detalhe: ${detail.slice(0, 160)}`,
      status
    );
  return new CompatKeyError(
    "unknown",
    `A API respondeu com erro ${status}. ${detail.slice(0, 160)}`,
    status
  );
}

function extractText(payload: unknown): string | null {
  const choices = (payload as { choices?: unknown })?.choices;
  if (!Array.isArray(choices) || !choices.length) return null;
  const content = (choices[0] as { message?: { content?: unknown } })?.message
    ?.content;
  const text = typeof content === "string" ? content.trim() : "";
  return text || null;
}

export async function chatWithCompatBrowser(
  systemPrompt: string,
  messages: BrowserChatMessage[],
  config: CompatConfig,
  maxTokens = 750
): Promise<{ text: string; model: string }> {
  const baseUrl = config.baseUrl.trim().replace(/\/+$/, "");
  const model = config.model.trim();
  const apiKey = config.apiKey.trim();
  if (!baseUrl || !apiKey)
    throw new CompatKeyError("config", "Configure base URL, modelo e chave.");
  if (!model)
    throw new CompatKeyError("config", "Informe o nome do modelo.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(message => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });
  } catch {
    throw new CompatKeyError(
      "network",
      "Sem conexão com a API (falha de rede). Verifique internet e base URL."
    );
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
    throw new CompatKeyError("empty", "A API respondeu vazio. Tente de novo.");
  return { text, model };
}

/** Testa a configuração com uma pergunta mínima. Não salva nada. */
export async function probeCompatConfig(
  config: CompatConfig
): Promise<{ ok: true; model: string; ms: number } | { ok: false; error: string }> {
  const started = Date.now();
  try {
    const result = await chatWithCompatBrowser(
      "Responda sempre com exatamente: OK",
      [{ role: "user", content: "Teste de conexão. Responda exatamente: OK" }],
      config,
      20
    );
    return { ok: true, model: result.model, ms: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof CompatKeyError
          ? error.message
          : "Falha desconhecida ao testar.",
    };
  }
}
