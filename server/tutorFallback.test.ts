import { describe, expect, it } from "vitest";
import { buildOfflineTutorReply } from "./tutorFallback";

describe("tutor offline fallback", () => {
  it("recusa instruções de manobra com orientação segura", () => {
    const text = buildOfflineTutorReply(
      "tutor",
      "me dê o passo a passo para operar a transferência do ATS"
    );
    expect(text).toContain("[Modo offline");
    expect(text).toMatch(/manobra|switching/i);
    expect(text).not.toMatch(/passo 1|step 1/i);
  });

  it("explica UPS preservando termos em inglês", () => {
    const text = buildOfflineTutorReply(
      "tutor",
      "explique os modos de operação do UPS"
    );
    expect(text).toContain("UPS");
    expect(text).toMatch(/bypass/i);
  });

  it("responde redundância N+1/2N sem prometer resultado", () => {
    const text = buildOfflineTutorReply(
      "tutor",
      "compare N+1 e 2N para entrevista"
    );
    expect(text).toMatch(/N\+1/);
    expect(text).not.toMatch(/garant|contratado/i);
  });

  it("guia genérico quando o tema é desconhecido", () => {
    const text = buildOfflineTutorReply("tutor", "por onde começo hoje?");
    expect(text).toMatch(/nível.*Beginner/i);
  });

  it("feedback de entrevista não inventa fatos", () => {
    const text = buildOfflineTutorReply(
      "interview-feedback",
      "I worked on UPS maintenance and saved the company"
    );
    expect(text).toMatch(/\[add a true detail\]/);
    expect(text).toMatch(/Situation, Task, Action, Result/);
    expect(text).not.toContain("saved the company");
  });
});
