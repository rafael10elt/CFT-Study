/**
 * Fallback educacional offline do tutor.
 *
 * Usado quando o serviço de IA gerenciado está indisponível (sem chave,
 * sem créditos ou falha de rede). Mantém o app funcional com respostas
 * locais, em português brasileiro, preservando termos técnicos em inglês
 * e respeitando as mesmas regras de segurança do prompt do tutor online:
 * - sem sequência de manobra / switching / isolamento / reenergização;
 * - sem inventar fatos, cursos, certificações ou experiências;
 * - sem substituir procedimentos oficiais, fabricante ou profissionais.
 */

export type OfflineTutorMode = "tutor" | "interview-feedback";

const MANOBRA =
  /(manobra|switching|isola|desenergiz|reenergiz|religamento|bypass manual|comissiona|interven..o em (painel|equipamento|ups|quadro)|passo a passo (para|de) (operar|ligar|transferir)|setpoint.*(alterar|mudar|ajustar).*na pr.tica|como (ligar|desligar|operar|transferir|resetar))/i;

const SAFETY_REFUSAL =
  "Não posso fornecer instruções executáveis de manobra, switching, isolamento/desenergização, reenergização ou intervenção em equipamento elétrico energizado/crítico — nem setpoints ou passos para trabalho perigoso. " +
  "Abordagem segura e geral: (1) preserve distância e não opere nada fora do escopo autorizado; (2) registre fatos — horário, equipamento, alarme/fonte, leituras e impacto confirmado; " +
  "(3) consulte o SOP/MOP/EOP aplicável e a avaliação de risco/permit to work do site; (4) interrompa a atividade de forma segura quando apropriado e escale pelos contatos e severidade definidos pela organização. " +
  "Posso ajudar com conceitos, comparações entre sistemas, interpretação de alarmes em nível educacional e comunicação em inglês.";

interface Rule {
  test: RegExp;
  reply: string;
}

const RULES: Rule[] = [
  {
    test: /(ups|nobreak|bypass|retificador|inversor|autonomia)/i,
    reply:
      "UPS (Uninterruptible Power Supply): sustenta a carga crítica na transição entre fontes e condiciona a energia. " +
      "Conceitos de revisão: modos normal/bateria/bypass (manutenção e estático), autonomia reportada vs. autonomia real, e a diferença entre alarme, leitura e impacto confirmado na carga. " +
      "Em um alarme hipotético, registre horário, fonte do alarme, equipamento, leituras de entrada/saída e redundância restante; siga a severidade do procedimento local e escale. " +
      "Nenhum teste, reset ou transferência deve ser tentado sem procedimento aprovado, avaliação de risco e pessoal autorizado — verifique detalhes com a documentação do fabricante.",
  },
  {
    test: /(ats|sts|transfer.ncia|chave de transfer)/i,
    reply:
      "ATS (Automatic Transfer Switch) e STS (Static Transfer Switch): comutam a alimentação entre fontes normal e alternativa. " +
      "Para estudo, compare: princípio de comutação, tempo de transferência, o que o monitoramento informa (posição, alarmes) e o que permanece desconhecido sem dados confirmados. " +
      "Um alarme de transferência não comprova, sozinho, continuidade ou perda da carga — preserve hora, fonte, escopo e impacto confirmado, e escale pela rota do site. " +
      "Nunca comande ou force transferências fora de procedimento aprovado.",
  },
  {
    test: /(bateria|battery|string|célula|celula)/i,
    reply:
      "Battery systems: strings/conjuntos que sustentam a UPS na ausência da fonte principal. " +
      "Revisão: monitoramento (tensão, temperatura, tendências), diferença entre saída aparente da UPS e estado real das baterias, e por que autonomia exige dados/testes aprovados — nunca inferência visual. " +
      "Diante de um alarme de string, registre identificador disponível, horário, fonte e leituras; não toque em terminais nem proponha ensaios. Testes de descarga dependem de método aprovado e responsáveis designados.",
  },
  {
    test: /(gerador|generator|load bank|banco de carga|diesel)/i,
    reply:
      "Standby generators: geração reserva acionada na indisponibilidade da fonte principal. " +
      "Para estudo: interfaces com ATS/alimentação de emergência, o que um registro de teste informa (resultado reportado, horário, escopo) e o que exige confirmação (causa, impacto no site, próxima ação). " +
      "Um start failure em teste não autoriza concluir falha de toda a geração nem repetir tentativas — preserve o contexto e escale à equipe responsável. Verificação técnica segue método aprovado.",
  },
  {
    test: /(n\+1|\b2n\b|redund.ncia|spof|single point|ponto .nico)/i,
    reply:
      "Redundância: N é a capacidade necessária; N+1 adiciona um elemento redundante; 2N prevê dois sistemas/caminhos completos, conforme a arquitetura do site. " +
      "Limitações importantes: redundância nominal não elimina dependências comuns (single points of failure) — ex.: utilidades, controles ou caminhos compartilhados. " +
      "Ao comparar, cite sempre a arquitetura de referência e o que ela tolera ou não. Confirme topologias reais na documentação do site.",
  },
  {
    test: /(crac|crah|chiller|cooling|airflow|hot spot|hotspot|corredor|conten|umidade|temperatura)/i,
    reply:
      "Cooling: chillers e circuitos de água gelada sustentam unidades como CRAH; CRAC típico opera com ciclo próprio de refrigeração. " +
      "Revisão: caminho do frio, airflow/contenção hot/cold aisle, e a diferença entre leitura de um sensor, tendência da zona e impacto confirmado na carga de TI. " +
      "Em alarme de temperatura, cruze fontes de dados autorizadas, registre horário/zona/leituras e escale antes do limite do procedimento local. Não altere setpoints nem intervenha fisicamente sem autorização.",
  },
  {
    test: /(bms|epms|dcim|telemetria|bacnet|modbus|sensor|alarme|pue)/i,
    reply:
      "BMS/EPMS/DCIM: camadas de supervisão predial, elétrica e de gestão da infraestrutura. " +
      "Pontos de estudo: priorização por severidade aprovada, confiabilidade dos dados (timestamp, fonte, redundância de medição) e a distinção entre perda de comunicação/telemetria e falha física — operar com dados congelados exige cautela redobrada e escalonamento. " +
      "PUE (Power Usage Effectiveness) compara energia total e de TI; interprete-o com contexto (clima, carga, período) e sem alegar eficiência absoluta.",
  },
  {
    test: /(loto|bloqueio|etiquetagem|ppe|epi|risk assessment|avalia..o de risco|permit to work|permiss.o|sop|mop|eop|toolbox|handover|passagem de turno|escalon|incident)/i,
    reply:
      "Segurança e procedimentos: LOTO (bloqueio e etiquetagem), PPE/EPI, avaliação de risco e permit to work controlam trabalhos com energia. " +
      "SOP orienta rotinas; MOP detalha tarefas específicas aprovadas; EOP guia emergências. Se a condição real diverge do escopo aprovado: pare de forma segura, preserve a área, registre a divergência e escale — nunca improvise. " +
      "Comunicação eficaz inclui horário, fonte, impacto conhecido, incerteza, ações tomadas e próximo responsável. Documentos do site prevalecem sempre.",
  },
  {
    test: /(entrevista|interview|star|resume|resume|curriculum|vaga|job|shift|handover)/i,
    reply:
      "Para entrevistas em inglês, estruture respostas com fatos reais: Situation, Task, Action, Result (STAR), separando observação, hipótese e conclusão. " +
      "Exemplo de esqueleto (complete apenas com fatos verdadeiros): “During a [shift/routine], [system] reported [alarm/reading] at [time]. I recorded [facts], followed [procedure/route] and escalated to [role]. The confirmed outcome was [result].” " +
      "Não invente incidentes, números, responsabilidades ou resultados. Pratique shift handover com status, pendências, riscos e responsável seguinte.",
  },
];

const GENERIC_TUTOR =
  "Vamos estudar por blocos: (1) qual sistema/equipamento está em foco e sua função no caminho crítico; " +
  "(2) quais informações confiáveis o monitoramento fornece (fonte, horário, leituras) e o que permanece desconhecido; " +
  "(3) como comunicar fatos com clareza em português e em inglês técnico; (4) quando parar e escalar segundo o procedimento do site. " +
  "Diga o tema (ex.: UPS, ATS/STS, baterias, geradores, N+1/2N, CRAC/CRAH, BMS/EPMS/DCIM, PUE, LOTO, SOP/MOP/EOP) e seu nível (Beginner, Basic, Intermediate, Advanced ou Practical experience) para eu calibrar a explicação. " +
  "Lembrete: este é o modo offline — respostas locais de estudo, sem substituir documentação oficial, fabricante ou profissionais responsáveis.";

const GENERIC_INTERVIEW_FEEDBACK =
  "Estou em modo offline, então ofereço um checklist de revisão (sem inventar fatos sobre sua experiência): " +
  "(1) Clareza — a resposta cita sistema, horário/fonte e impacto confirmado? " +
  "(2) Estrutura — Situation, Task, Action, Result aparecem em ordem? " +
  "(3) Vocabulário — termos em inglês usados no setor (alarm acknowledgement, critical load, escalation, handover)? " +
  "(4) Gramática — tempos verbais consistentes no passado para fatos? " +
  "(5) Fidelidade — cada afirmação vem do seu texto; marque lacunas com [add a true detail] em vez de preenchê-las. " +
  "Nada aqui adiciona experiência, números ou resultados à sua resposta. " +
  "Reescreva preservando apenas o que você afirmou e peça revisão detalhada quando o serviço de IA estiver disponível.";

const OFFLINE_PREFIX =
  "[Modo offline — resposta local de estudo] O serviço de IA está indisponível no momento, então segue uma orientação educacional gerada neste servidor, sem conexão externa. ";

export function buildOfflineTutorReply(
  mode: OfflineTutorMode,
  lastUserText: string
): string {
  const text = (lastUserText ?? "").slice(0, 2500);
  if (mode === "interview-feedback") {
    return `${OFFLINE_PREFIX}${GENERIC_INTERVIEW_FEEDBACK}`;
  }
  if (MANOBRA.test(text)) return `${OFFLINE_PREFIX}${SAFETY_REFUSAL}`;
  for (const rule of RULES) {
    if (rule.test.test(text)) return `${OFFLINE_PREFIX}${rule.reply}`;
  }
  return `${OFFLINE_PREFIX}${GENERIC_TUTOR}`;
}
