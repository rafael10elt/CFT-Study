import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { buildOfflineTutorReply } from "./tutorFallback";
import { chatWithFreeProviders } from "./aiProviders";
import { buildTutorSystemPrompt } from "@shared/tutorPrompt";

const TUTOR_RATE_WINDOW_MS = 60_000;
const TUTOR_RATE_MAX = 12;
const tutorRate = new Map<string, { startedAt: number; count: number }>();

function assertTutorRateLimit(address: string) {
  const now = Date.now();
  for (const [key, value] of tutorRate) {
    if (now - value.startedAt >= TUTOR_RATE_WINDOW_MS) tutorRate.delete(key);
  }
  const current = tutorRate.get(address);
  if (!current || now - current.startedAt >= TUTOR_RATE_WINDOW_MS) {
    if (tutorRate.size >= 5000)
      tutorRate.delete(tutorRate.keys().next().value!);
    tutorRate.set(address, { startedAt: now, count: 1 });
    return;
  }
  if (current.count >= TUTOR_RATE_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        "Limite temporário de mensagens atingido. Aguarde um minuto e tente novamente.",
    });
  }
  current.count += 1;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tutor: router({
    ask: publicProcedure
      .input(
        z.object({
          mode: z.enum(["tutor", "interview-feedback"]).default("tutor"),
          messages: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(2500),
              })
            )
            .min(1)
            .max(12),
        })
      )
      .mutation(async ({ input, ctx }) => {
        assertTutorRateLimit(
          ctx.req.ip || ctx.req.socket.remoteAddress || "unknown"
        );
        const systemPrompt = buildTutorSystemPrompt(input.mode);
        try {
          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...input.messages.map(message => ({
                role: message.role,
                content: message.content,
              })),
            ],
            maxTokens: 750,
          });
          const content = result.choices?.[0]?.message?.content;
          const text =
            typeof content === "string"
              ? content.trim()
              : Array.isArray(content)
                ? content
                    .filter(part => part.type === "text")
                    .map(part => part.text)
                    .join("\n")
                    .trim()
                : "";
          if (!text) throw new Error("A resposta do tutor veio vazia.");
          return { text, offline: false as const, provider: "manus" as const };
        } catch (error) {
          console.error(
            "Managed tutor failed, trying free providers:",
            error instanceof Error ? error.message : "unknown error"
          );
          // 1) Provedores gratuitos (Gemini → Ollama), se configurados.
          const free = await chatWithFreeProviders(
            systemPrompt,
            input.messages.map(message => ({
              role: message.role,
              content: message.content,
            }))
          );
          if (free) return { text: free.text, offline: false as const, provider: free.provider };
          // 2) Sem nenhuma IA disponível: orientação educacional local e segura.
          console.error("No AI provider available, using offline fallback.");
          const lastUser = input.messages
            .filter(message => message.role === "user")
            .at(-1)?.content;
          return {
            text: buildOfflineTutorReply(input.mode, lastUser ?? ""),
            offline: true as const,
            provider: "offline" as const,
          };
        }
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
