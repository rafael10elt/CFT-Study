import type {
  FailureScenario,
  InterviewQuestion,
  QuizQuestion,
  Topic,
} from "./study-data";

export const EXTRA_TOPICS: Topic[] = [
  {
    id: "incident-communication",
    name: "Incident Communication",
    category: "Data Centre Operations",
    summary:
      "Registro factual, comunicação de incidente, passagem de turno e escalonamento.",
    prompt:
      "Praticar comunicação em inglês com horário, fonte, impacto conhecido, incerteza e próximo escalonamento.",
  },
];

export const EXTRA_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q13",
    type: "Short technical answer",
    topicId: "incident-communication",
    topic: "Incident Communication",
    difficulty: "Intermediate",
    prompt:
      "Em inglês, escreva uma atualização breve sobre uma leitura anormal. Inclua pelo menos dois elementos factuais importantes para a equipe seguinte.",
    options: [],
    expectedKeywords: ["time", "source", "impact", "unknown", "escalat"],
    explanation:
      "Um handover útil separa observações e hipóteses e pode identificar horário, fonte/alarme, impacto conhecido, incerteza e rota de escalonamento. A correspondência de palavras do app é apenas uma lista indicativa; revise o sentido e a fidelidade dos fatos.",
  },
  {
    id: "q14",
    type: "Short technical answer",
    topicId: "safety",
    topic: "LOTO and Safety",
    difficulty: "Advanced",
    prompt:
      "Em inglês, redija uma frase curta para comunicar que a condição observada difere do escopo aprovado e que a situação precisa ser escalada.",
    options: [],
    expectedKeywords: ["stop", "safe", "condition", "approved", "escalat"],
    explanation:
      "A resposta deve comunicar a diferença em relação ao escopo autorizado, não improvisar nem continuar fora da aprovação e escalar segundo o procedimento local. O reconhecimento automático de palavras serve somente de checklist e não valida conduta.",
  },
];

export const EXTRA_SCENARIOS: FailureScenario[] = [
  {
    id: "ats-transfer",
    title: "ATS Transfer Alarm",
    description:
      "O monitoramento registra um alarme de transferência ATS em uma atividade planejada. O estado esperado e o impacto ainda precisam ser confirmados pelos responsáveis.",
    context:
      "Um exercício de revisão pós-evento em um ambiente hipotético 24/7; nenhum dado de operação física está anexado.",
    system: "ATS and Critical Power",
    symptoms: [
      "Alarme de transferência reportado",
      "Estado final ou tempo do evento não confirmados",
      "Não há confirmação de impacto na carga",
    ],
    information: [
      "Horário e origem do alarme precisam ser consultados em registros autorizados",
      "O contexto de um teste ou evento ainda é incerto",
      "Procedimento/MOP específico não fornecido",
    ],
    questions: [
      "Quais detalhes factuais devem ser preservados?",
      "O que o alarme não permite concluir sozinho?",
      "Como você escalaria estado e impacto desconhecidos?",
    ],
    feedback:
      "Diferencie o alarme de uma conclusão sobre transferência ou continuidade da carga. Registre hora, fonte, escopo e dados confirmados; a interpretação do evento compete à equipe conforme documentos aprovados.",
    safety: [
      "Não comande ATS nem tente forçar uma transferência.",
      "Não trate este cenário como orientação de operação ou teste real.",
    ],
    escalation: [
      "Use a severidade e a rota definidas pelo site.",
      "Escalone discrepância de estado ou possível impacto segundo os procedimentos locais.",
      "Deixe a verificação técnica com profissionais autorizados.",
    ],
    vocabulary: [
      { term: "transfer event", meaning: "evento de transferência reportado" },
      { term: "source status", meaning: "estado reportado da fonte" },
      { term: "event log", meaning: "registro do evento" },
    ],
  },
  {
    id: "cooling-unit-failure",
    title: "Cooling Unit Fault Report",
    description:
      "Uma unidade de cooling aparece como faulted no monitoramento, enquanto as leituras de temperatura disponíveis permanecem sem tendência consolidada.",
    context:
      "Cenário educativo em uma zona com monitoramento, sem dados para avaliar capacidade ou redundância.",
    system: "Cooling Systems",
    symptoms: [
      "Estado de uma unidade sinalizado como fault",
      "Temperatura reportada em uma única janela",
      "Redundância disponível não confirmada",
    ],
    information: [
      "Nenhum procedimento, setpoint ou limite específico do site foi fornecido",
      "A telemetria disponível não descreve necessariamente a condição mecânica",
      "Impacto e duração ainda precisam ser avaliados",
    ],
    questions: [
      "Como você separa estado reportado de impacto térmico?",
      "Que contexto torna o alerta mais útil para a equipe?",
      "Como formular uma comunicação sem prescrever uma intervenção?",
    ],
    feedback:
      "Identifique unidade/zona, fonte, timestamp, tendência e escopo conforme os sistemas aprovados. Evite inferir capacidade disponível a partir de uma indicação isolada.",
    safety: [
      "Não altere setpoints, válvulas, controles nem equipamento.",
      "A resposta real depende dos limites, da documentação e da equipe autorizada do local.",
    ],
    escalation: [
      "Siga o threshold e os contatos de facilities definidos pela organização.",
      "Escalone tendência ou redundância comprometida se indicado pelo procedimento.",
      "Registre a incerteza da telemetria.",
    ],
    vocabulary: [
      {
        term: "cooling unit fault",
        meaning: "falha reportada em unidade de refrigeração",
      },
      { term: "cooling capacity", meaning: "capacidade de refrigeração" },
      { term: "temperature trend", meaning: "tendência de temperatura" },
    ],
  },
  {
    id: "abnormal-power-reading",
    title: "Abnormal Power Reading",
    description:
      "Uma leitura de energia destoa da tendência exibida no EPMS, mas não há relato confirmado de indisponibilidade.",
    context:
      "Análise inicial hipotética de anomalia observada em dashboard; nenhuma inspeção elétrica está autorizada por este exercício.",
    system: "Electrical Distribution and EPMS",
    symptoms: [
      "Uma leitura reportada se afasta do histórico visível",
      "Amostragem e unidade precisam ser verificadas",
      "Sem informação suficiente sobre causa ou impacto",
    ],
    information: [
      "Timestamp e equipamento são necessários para identificar a leitura",
      "O comportamento de outros pontos não foi confirmado",
      "Limites e response matrix pertencem ao site",
    ],
    questions: [
      "Como verificar o contexto da medição sem intervir fisicamente?",
      "Quais hipóteses devem permanecer não confirmadas?",
      "Qual seria um handover factual?",
    ],
    feedback:
      "Registre ponto de medição, unidade, horário, origem, escala temporal e impacto observado. Uma anomalia em telemetria não estabelece falha de componente nem ausência de risco.",
    safety: [
      "Não abra painéis, faça medições físicas ou altere proteção.",
      "Use apenas acessos de monitoramento permitidos e a resposta da organização.",
    ],
    escalation: [
      "Encaminhe a anomalia pelo processo de EPMS/facilities definido.",
      "Solicite revisão autorizada se os dados permanecerem inconsistentes ou ultrapassarem limites locais.",
    ],
    vocabulary: [
      { term: "abnormal reading", meaning: "leitura fora do padrão observado" },
      { term: "meter point", meaning: "ponto de medição" },
      { term: "trend deviation", meaning: "desvio da tendência" },
    ],
  },
  {
    id: "unexpected-equipment-state",
    title: "Unexpected Equipment Status",
    description:
      "Um equipamento aparece com status diferente daquele esperado no registro da atividade, mas a causa e o estado físico não foram confirmados.",
    context:
      "Cenário de interpretação de registros durante uma passagem de turno fictícia.",
    system: "Critical Infrastructure Monitoring",
    symptoms: [
      "Status divergente entre plano e dashboard",
      "Última atualização disponível em horário anterior",
      "Sem confirmação independente do estado",
    ],
    information: [
      "O registro de mudança e a telemetria podem ter timestamps diferentes",
      "O dashboard pode apresentar dado atrasado",
      "Não há informação autorizada de comando/operador neste exercício",
    ],
    questions: [
      "Como comunicar a discrepância sem assumir qual fonte está correta?",
      "Que timestamp e owner devem ser identificados?",
      "O que não se deve fazer a partir deste cenário?",
    ],
    feedback:
      "Descreva as duas fontes e respectivos horários, marque o estado atual como não confirmado e peça reconciliação pelo owner do sistema. Não trate a divergência como autorização para comandar equipamento.",
    safety: [
      "Não emita comandos nem tente alterar o status.",
      "Não assuma que dado atrasado representa condição segura.",
    ],
    escalation: [
      "Contate os responsáveis de operações/monitoramento definidos pela organização.",
      "Eleve a discrepância se o escopo afetar risco ou capacidade.",
    ],
    vocabulary: [
      { term: "unexpected status", meaning: "estado inesperado reportado" },
      { term: "last updated", meaning: "última atualização" },
      { term: "status discrepancy", meaning: "divergência de estado" },
    ],
  },
  {
    id: "critical-alarm-shift",
    title: "Critical Alarm During a Shift",
    description:
      "Um alarme classificado como crítico aparece durante a troca de turno, enquanto a equipe também precisa preservar a passagem das pendências abertas.",
    context:
      "Cenário simulado: papéis, impacto, severidade e contatos dependem integralmente das regras do site.",
    system: "Critical Operations and Incident Communication",
    symptoms: [
      "Alarme com classificação exibida como crítica",
      "Informações disponíveis limitadas a um resumo",
      "Responsabilidade pela próxima ação ainda a ser confirmada",
    ],
    information: [
      "Response matrix, escala de contatos e sistemas de registro não foram anexados",
      "O fato, impacto e status atual precisam ser confirmados por responsáveis",
      "A segurança de pessoas e continuidade deve seguir procedimentos oficiais",
    ],
    questions: [
      "Quais informações tornam a passagem factual?",
      "Como coordenar a comunicação sem atrasar a resposta definida pelo site?",
      "Quando e a quem escalar segundo autoridade local?",
    ],
    feedback:
      "Siga primeiro a response matrix e a cadeia institucional para evento crítico; não dependa do material educativo como runbook. Preserve hora, local/equipamento, fonte, impacto conhecido, owner e pendências para o handover.",
    safety: [
      "Não adie uma escalada exigida pelo EOP/SOP do site para concluir esta simulação.",
      "Não improvise resposta operacional com base em exemplos genéricos.",
    ],
    escalation: [
      "Use imediatamente os contatos e prazos da organização para o nível classificado.",
      "Informe supervisor e equipe seguinte de acordo com a governança local.",
      "Registre fatos, fonte e estado ainda desconhecido.",
    ],
    vocabulary: [
      { term: "critical alarm", meaning: "alarme classificado como crítico" },
      { term: "response matrix", meaning: "matriz institucional de resposta" },
      { term: "shift handover", meaning: "passagem de turno" },
    ],
  },
  {
    id: "unexpected-maintenance-condition",
    title: "Unexpected Condition During Maintenance",
    description:
      "Durante uma atividade autorizada hipotética, a condição encontrada não corresponde ao escopo ou documentação aprovados.",
    context:
      "Exercício de comunicação; não fornece instruções de isolação nem autorização de trabalho.",
    system: "Maintenance, LOTO and Safety",
    symptoms: [
      "Condição observada diverge do plano aprovado",
      "Risco e impacto não estão avaliados",
      "Não há aprovação para ampliar o escopo",
    ],
    information: [
      "A atividade depende de permissão e procedimento vigentes",
      "O estudante não recebeu autorização adicional neste cenário",
      "Só o owner responsável pode definir a retomada conforme o sistema local",
    ],
    questions: [
      "Como declarar que o escopo deixou de corresponder às condições observadas?",
      "Como priorizar pessoas e infraestrutura?",
      "Que aprovação e comunicação são necessárias antes de uma decisão?",
    ],
    feedback:
      "Não improvise nem amplie o escopo. Siga o procedimento aprovado para pausar/cessar de modo seguro quando apropriado, preserve o controle da atividade e comunique a discrepância antes de qualquer continuação.",
    safety: [
      "Não execute switching, LOTO, isolação, teste ou reenergização com base na simulação.",
      "A avaliação de risco, permissão, EOP/MOP/SOP e pessoal autorizado sempre prevalecem.",
    ],
    escalation: [
      "Notifique o supervisor/permit owner e a equipe designada.",
      "Registre a condição factual e o status da atividade.",
      "Só retome segundo nova avaliação e aprovação formal do processo local.",
    ],
    vocabulary: [
      { term: "unexpected condition", meaning: "condição inesperada" },
      { term: "approved scope", meaning: "escopo aprovado" },
      { term: "permit owner", meaning: "responsável pela permissão" },
    ],
  },
  {
    id: "cooling-telemetry-incident",
    title: "Cooling Trend and Sensor Discrepancy",
    description:
      "A temperatura reportada aumenta em uma fonte e permanece estável em outra, durante um período curto de observação.",
    context:
      "Análise de dados hipotética; localização e qualidade dos sensores precisam ser identificadas antes de inferir o comportamento da zona.",
    system: "Cooling Systems and Incident Reporting",
    symptoms: [
      "Tendência ascendente em um ponto",
      "Outro sensor sem a mesma variação",
      "Nenhuma confirmação física independente",
    ],
    information: [
      "Janelas de amostragem podem diferir",
      "Localização e calibração não foram confirmadas",
      "O limite de alarme e a rota de escalonamento vêm do site",
    ],
    questions: [
      "Como registrar a diferença entre as fontes?",
      "Quais perguntas ajudam a contextualizar a tendência?",
      "Como evitar declarar causa sem evidência?",
    ],
    feedback:
      "Uma síntese precisa identifica zonas, fontes, timestamps, tendências e incertezas. Compare apenas registros autorizados e peça interpretação à equipe responsável conforme a resposta institucional.",
    safety: [
      "Não altere controle HVAC, setpoint ou airflow.",
      "Não conclua que não há risco a partir de um sensor estável.",
    ],
    escalation: [
      "Use os limites e os owners de facilities do site.",
      "Mantenha acompanhamento segundo procedimento e comunique tendência divergente.",
    ],
    vocabulary: [
      { term: "sensor discrepancy", meaning: "divergência entre sensores" },
      { term: "sampling window", meaning: "janela de amostragem" },
      { term: "temperature trend", meaning: "tendência de temperatura" },
    ],
  },
];

export const EXTRA_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "ops",
    category: "Critical Facilities Operations",
    question:
      "How do you maintain safe and reliable operations during a 24/7 shift?",
    help: "Fale de comunicação, registros, procedimento e seu escopo real; não prometa disponibilidade absoluta.",
    keywords: ["shift", "procedure", "communication"],
  },
  {
    id: "hvlv",
    category: "HV/LV Electrical Infrastructure",
    question:
      "What would you consider when reviewing an HV/LV infrastructure alarm?",
    help: "Descreva contexto e escalonamento sem instruir uma manobra nem presumir autorização.",
    keywords: ["HV/LV", "evidence", "escalation"],
  },
  {
    id: "maintenance-types",
    category: "Preventive and Corrective Maintenance",
    question:
      "How do preventive and corrective maintenance differ in your work?",
    help: "Use exemplos reais, escopo de responsabilidade, registro e controles aplicáveis.",
    keywords: ["preventive", "corrective", "records"],
  },
  {
    id: "diagnosis",
    category: "Fault Diagnosis",
    question:
      "How do you separate an observed symptom from a possible root cause?",
    help: "Explique evidências, hipótese, limites do diagnóstico inicial e quando buscar apoio.",
    keywords: ["symptom", "evidence", "root cause"],
  },
  {
    id: "procedures",
    category: "SOP, MOP and EOP",
    question: "When might an SOP, an MOP and an EOP be relevant to operations?",
    help: "Apresente distinções gerais e ressalte que uso/aprovação dependem da governança local.",
    keywords: ["SOP", "MOP", "EOP"],
  },
  {
    id: "incident-report",
    category: "Incident Reporting",
    question: "What information should a factual incident report include?",
    help: "Contexto, horário, fontes, impacto conhecido, incerteza, owner e ações aprovadas.",
    keywords: ["timestamp", "impact", "evidence"],
  },
  {
    id: "emergency",
    category: "Emergency Response",
    question: "How would you communicate during an emergency response?",
    help: "Siga somente a cadeia/EOP oficial e não substitua procedimentos do empregador.",
    keywords: ["EOP", "communication", "escalation"],
  },
  {
    id: "teamwork",
    category: "Teamwork",
    question:
      "How do you work with colleagues when system status or ownership is unclear?",
    help: "Mostre escuta, handover, consulta a owners e uso de canais acordados — com fatos verdadeiros.",
    keywords: ["team", "handover", "owner"],
  },
  {
    id: "continuous",
    category: "Continuous Improvement",
    question:
      "Can you describe a real improvement you contributed to in a maintenance or operations process?",
    help: "Use apenas um exemplo real. Se a contribuição/resultados não estiverem confirmados, sinalize a lacuna.",
    keywords: ["improvement", "action", "result"],
  },
];
