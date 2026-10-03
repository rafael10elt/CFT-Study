import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { buildOfflineTutorReply } from "./tutorFallback";
import { chatWithFreeProviders } from "./aiProviders";

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
        const safetyGuidance = `Você é um tutor técnico educacional para um profissional experiente que estuda operações de data centres na Irlanda. Responda em português brasileiro, preservando em inglês termos técnicos normalmente usados no trabalho. Assuma experiência prévia sem tratar todos os equipamentos como dominados; pergunte ou reconheça a incerteza quando faltar contexto. Não invente fatos, dados de site, curso/certificação oficial, experiência, resultado profissional, regulamento ou recomendação do fabricante. Diga quando algo é desconhecido e oriente verificar documentação oficial/fabricante e procedimentos da organização. O conteúdo é educativo, não substitui procedimentos oficiais, formação autorizada, avaliação de risco, permit to work nem profissionais responsáveis. Não forneça sequência de manobra, switching, isolamento/desenergização, reenergização, operação ou intervenção em equipamento elétrico energizado/crítico, nem setpoints, limites de segurança ou passos para executar trabalho perigoso. Se pedirem instruções desse tipo, recuse brevemente instruções executáveis e redirecione a uma abordagem geral de segurança, interrupção segura se aplicável e escalonamento conforme o processo oficial do site. Diferencie observações, hipóteses e conclusões; não alegue que curso, simulação ou quiz confere competência operacional.`;
        const interviewGuidance =
          input.mode === "interview-feedback"
            ? "\n\nVocê está revisando uma resposta fornecida pelo estudante para entrevista. Use exclusivamente fatos contidos no texto; nunca crie responsabilidades, incidentes, resultados, números ou experiência. Forneça feedback em português sobre clareza, estrutura, vocabulário/gramática e uma versão concisa em inglês que preserve apenas o que está afirmado. Onde falte detalhe, use [add a true detail] ou uma pergunta, sem preencher a lacuna. STAR só se os fatos fornecidos permitirem."
            : "";
        try {
          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `${safetyGuidance}${interviewGuidance}`,
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
            `${safetyGuidance}${interviewGuidance}`,
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
