/**
 * Provedores de IA gratuitos para o tutor (fora do serviço gerenciado).
 *
 * Ordem de tentativa no endpoint do tutor:
 *   1. serviço gerenciado (invokeLLM — Manus);
 *   2. Google Gemini via REST (cota gratuita do AI Studio);
 *   3. Ollama local (100% gratuito e offline, ex.: llama3.1:8b);
 *   4. fallback educacional local (tutorFallback.ts).
 *
 * Nenhuma credencial chega ao navegador: as chaves ficam no servidor
 * (variáveis de ambiente ou `.env`, que é ignorado pelo git).
 */

export interface FreeChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type FreeProviderId = "gemini" | "compat" | "ollama";

export interface FreeChatResult {
  text: string;
  provider: FreeProviderId;
}

const GEMINI_MODELS = (process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : []
).concat(["gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"]);

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

function toGeminiContents(messages: FreeChatMessage[]) {
  return messages.map(message => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function parseGeminiText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || !candidates.length) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } })?.content
    ?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .filter(
      (part): part is { text: string } =>
        !!part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
    )
    .map(part => part.text)
    .join("\n")
    .trim();
  return text || null;
}

export async function chatWithGemini(
  systemPrompt: string,
  messages: FreeChatMessage[],
  apiKey = process.env.GEMINI_API_KEY ?? ""
): Promise<string | null> {
  if (!apiKey.trim()) return null;
  const seen = new Set<string>();
  for (const model of GEMINI_MODELS) {
    if (seen.has(model)) continue;
    seen.add(model);
    const { signal, done } = withTimeout(60_000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: toGeminiContents(messages),
            generationConfig: { maxOutputTokens: 750, temperature: 0.4 },
          }),
        }
      );
      if (response.status === 404) continue; // modelo desconhecido: tenta o próximo
      if (!response.ok) return null;
      const text = parseGeminiText(await response.json());
      if (text) return text;
      return null;
    } catch {
      return null;
    } finally {
      done();
    }
  }
  return null;
}

export function ollamaHost(): string {
  return (process.env.OLLAMA_HOST ?? "http://localhost:11434").replace(/\/+$/, "");
}

export function ollamaModel(): string {
  return process.env.OLLAMA_MODEL ?? "llama3.1:8b";
}

function parseOllamaText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const message = (payload as { message?: { content?: unknown } }).message;
  const text =
    typeof message?.content === "string" ? message.content.trim() : "";
  return text || null;
}

export async function chatWithOllama(
  systemPrompt: string,
  messages: FreeChatMessage[],
  host = ollamaHost(),
  model = ollamaModel()
): Promise<string | null> {
  const { signal, done } = withTimeout(120_000);
  try {
    const response = await fetch(`${host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        model,
        stream: false,
        options: { num_predict: 750, temperature: 0.4 },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(message => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });
    if (!response.ok) return null;
    return parseOllamaText(await response.json());
  } catch {
    return null; // Ollama ausente/inacessível: o chamador segue para o fallback
  } finally {
    done();
  }
}

export interface OpenAICompatConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export function openaiCompatConfig(): OpenAICompatConfig {
  return {
    baseUrl: (process.env.OPENAI_COMPAT_BASE_URL ?? "").replace(/\/+$/, ""),
    model: process.env.OPENAI_COMPAT_MODEL ?? "deepseek-chat",
    apiKey: process.env.OPENAI_COMPAT_API_KEY ?? "",
  };
}

function parseCompatText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices.length) return null;
  const content = (choices[0] as { message?: { content?: unknown } })?.message
    ?.content;
  const text = typeof content === "string" ? content.trim() : "";
  return text || null;
}

/** API estilo OpenAI (/chat/completions): DeepSeek, OpenAI, etc. */
export async function chatWithOpenAICompatible(
  systemPrompt: string,
  messages: FreeChatMessage[],
  config = openaiCompatConfig()
): Promise<string | null> {
  const baseUrl = config.baseUrl.trim().replace(/\/+$/, "");
  if (!baseUrl || !config.apiKey.trim()) return null;
  const { signal, done } = withTimeout(90_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        max_tokens: 750,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(message => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });
    if (!response.ok) return null;
    return parseCompatText(await response.json());
  } catch {
    return null;
  } finally {
    done();
  }
}

/** Tenta Gemini, depois API OpenAI-compatível e depois Ollama. */
export async function chatWithFreeProviders(
  systemPrompt: string,
  messages: FreeChatMessage[]
): Promise<FreeChatResult | null> {
  const gemini = await chatWithGemini(systemPrompt, messages);
  if (gemini) return { text: gemini, provider: "gemini" };
  const compat = await chatWithOpenAICompatible(systemPrompt, messages);
  if (compat) return { text: compat, provider: "compat" };
  const ollama = await chatWithOllama(systemPrompt, messages);
  if (ollama) return { text: ollama, provider: "ollama" };
  return null;
}
