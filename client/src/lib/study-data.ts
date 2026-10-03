import {
  EXTRA_INTERVIEW_QUESTIONS,
  EXTRA_QUIZ_QUESTIONS,
  EXTRA_SCENARIOS,
  EXTRA_TOPICS,
} from "./study-data-extra";

export type StudyStatus =
  | "Not started"
  | "In progress"
  | "Completed"
  | "Review required"
  | "Skipped";
export type KnowledgeLevel =
  | "Beginner"
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Practical experience";
export type VocabularyLevel =
  | "New"
  | "Learning"
  | "Familiar"
  | "Confident"
  | "Review required";

export interface StudyDay {
  id: string;
  day: number;
  week: number;
  weekTitle: string;
  title: string;
  objective: string;
  topics: string[];
  activities: string[];
  estimate: number;
  resources: string[];
  actualMinutes?: number;
  status: StudyStatus;
  notes: string;
  completedAt?: string;
  scheduledDate?: string;
}

export const WEEKS = [
  {
    number: 1,
    title: "Critical Power Systems",
    focus: "Energia, redundância e pontos de falha",
    accent: "mint",
  },
  {
    number: 2,
    title: "Cooling, BMS and DCIM",
    focus: "Refrigeração de precisão e monitoramento",
    accent: "blue",
  },
  {
    number: 3,
    title: "Critical Operations, Safety and Procedures",
    focus: "Segurança, procedimentos e comunicação operacional",
    accent: "amber",
  },
  {
    number: 4,
    title: "Consolidation and Technical Interview Preparation",
    focus: "Consolidação, lacunas e entrevistas em inglês",
    accent: "violet",
  },
] as const;

const WEEK_CONTENT: Record<number, string[]> = {
  1: [
    "Data Center Fundamentals — Schneider Electric University (To be verified)",
    "Power and Cooling Capacity Management — Schneider Electric University (To be verified)",
    "Data Centre Electrical and Critical Power — EDWartens (To be verified)",
  ],
  2: [
    "HVAC Thermodynamic States — curso/módulo a identificar (A confirmar)",
    "Data Centre Cooling, BMS and DCIM — EDWartens (To be verified)",
    "Building Management Systems — plataforma/módulo a identificar (A confirmar)",
    "Power and Cooling Capacity Management — Schneider Electric University (To be verified)",
    "High-Density Power Distribution — conteúdo/plataforma a identificar (A confirmar)",
  ],
  3: [
    "Critical Infrastructure Track — RackReady (To be verified)",
    "Safety & Procedures — RackReady (To be verified)",
    "Power Redundancy — Schneider Electric University (To be verified)",
    "Efficiency and Monitoring — Schneider Electric University (To be verified)",
  ],
  4: [
    "DCCA Learning Path — Schneider Electric University (caso disponível; To be verified)",
    "Critical Infrastructure Track — RackReady (To be verified)",
    "Data Centre Electrical and Critical Power — EDWartens (To be verified)",
    "Data Centre Cooling, BMS and DCIM — EDWartens (To be verified)",
  ],
};

const day = (
  n: number,
  week: number,
  title: string,
  objective: string,
  topics: string[],
  activities: string[],
  estimate = 75
): StudyDay => ({
  id: `day-${String(n).padStart(2, "0")}`,
  day: n,
  week,
  weekTitle: WEEKS[week - 1].title,
  title,
  objective,
  topics,
  activities,
  estimate,
  resources: [...(WEEK_CONTENT[week] ?? [])],
  status: "Not started",
  notes: "",
});

export const INITIAL_DAYS: StudyDay[] = [
  day(
    1,
    1,
    "Arquitetura do caminho de energia",
    "Mapear a alimentação da rede até a carga crítica e reconhecer camadas de distribuição.",
    ["Critical Power Systems", "Electrical Distribution"],
    [
      "Desenhe um power path simplificado.",
      "Marque transformadores, switchgear, UPS e distribuição final.",
      "Explique o caminho em inglês em 90 segundos.",
    ]
  ),
  day(
    2,
    1,
    "HV/LV, transformadores e proteção",
    "Revisar interfaces entre média e baixa tensão, proteção e grounding.",
    ["HV/LV Electrical Systems", "Critical Power Systems"],
    [
      "Compare funções de HV e LV no contexto do site.",
      "Identifique quais informações faltariam para avaliar uma anomalia hipotética.",
      "Revise conceitos de proteção/aterramento sem instruções de manobra.",
    ]
  ),
  day(
    3,
    1,
    "Switchgear, circuit breakers e distribuição",
    "Relacionar componentes à arquitetura e às fronteiras de monitoramento.",
    ["Electrical Distribution", "Critical Power Systems"],
    [
      "Rascunhe blocos do sistema de distribuição.",
      "Liste alarmes/leituras úteis em uma passagem de turno.",
      "Registre três perguntas para revisar com documentação oficial.",
    ]
  ),
  day(
    4,
    1,
    "UPS architecture e operating modes",
    "Consolidar função da UPS, modos de operação e dependências do sistema.",
    ["UPS and Battery Systems", "Critical Power Systems"],
    [
      "Compare UPS online, bypass e condições a esclarecer com o fabricante/procedimento local.",
      "Resolva o quiz de Critical Power.",
      "Escreva uma explicação curta em inglês.",
    ]
  ),
  day(
    5,
    1,
    "Battery systems e discharge testing",
    "Revisar bancos de baterias, monitoramento, autonomia e limites de teste.",
    ["UPS and Battery Systems"],
    [
      "Mapeie indicadores e alarmes relevantes.",
      "Avalie um cenário hipotético de battery alarm.",
      "Diferencie leitura, inferência e dado ainda não confirmado.",
    ]
  ),
  day(
    6,
    1,
    "ATS, STS e standby generators",
    "Comparar funções e interfaces de transferência e geração standby.",
    ["Standby Generators", "Critical Power Systems"],
    [
      "Compare ATS e STS em papel e contexto.",
      "Represente a relação entre generator, ATS/STS e UPS.",
      "Revise critérios gerais de escalonamento sem sequência operacional.",
    ]
  ),
  day(
    7,
    1,
    "N, N+1, 2N e single points of failure",
    "Discutir redundância nominal e analisar dependências comuns.",
    ["Redundancy", "Critical Power Systems"],
    [
      "Compare N, N+1 e 2N.",
      "Marque potenciais single points of failure em um diagrama simples.",
      "Faça uma revisão espaçada dos dias 1–6.",
    ]
  ),
  day(
    8,
    2,
    "HVAC thermodynamic states",
    "Conectar mudanças de estado e transferência de calor à refrigeração de precisão.",
    ["Cooling Systems", "Energy Efficiency and PUE"],
    [
      "Revise os estados termodinâmicos relevantes.",
      "Esboce o ciclo de refrigeração em blocos.",
      "Marque o módulo HVAC Thermodynamic States como A confirmar.",
    ]
  ),
  day(
    9,
    2,
    "Chillers e chilled water systems",
    "Explicar o papel de chillers e do circuito de água gelada.",
    ["Cooling Systems"],
    [
      "Desenhe um chilled-water path simplificado.",
      "Anote variáveis e alarmes que ajudam a contextualizar capacidade.",
      "Revise dependências de redundância.",
    ]
  ),
  day(
    10,
    2,
    "CRAC, CRAH e airflow management",
    "Diferenciar CRAC/CRAH e relacionar airflow às condições da sala.",
    ["Cooling Systems"],
    [
      "Compare CRAC, CRAH e chilled water.",
      "Analise um hot spot hipotético.",
      "Registre perguntas de diagnóstico, sem instruir intervenções físicas.",
    ]
  ),
  day(
    11,
    2,
    "Hot aisle / cold aisle containment",
    "Interpretar contenção, mistura de ar e sinais de airflow inadequado.",
    ["Cooling Systems"],
    [
      "Rascunhe uma fileira hot/cold aisle.",
      "Liste causas possíveis de recirculação para investigar por documentação e equipe.",
      "Pratique a explicação em inglês.",
    ]
  ),
  day(
    12,
    2,
    "Sensores, temperatura e umidade",
    "Conectar sensor, localização, contexto e confiabilidade da telemetria.",
    ["BMS, EPMS and DCIM", "Cooling Systems"],
    [
      "Compare temperatura de entrada/saída e ambiente.",
      "Analise sinais conflitantes entre sensores.",
      "Diferencie alarme, medida e hipótese.",
    ]
  ),
  day(
    13,
    2,
    "BMS, EPMS e DCIM",
    "Explicar escopo e uso operacional das três plataformas.",
    ["BMS, EPMS and DCIM"],
    [
      "Monte uma comparação BMS/EPMS/DCIM.",
      "Identifique alarmes e owners possíveis em um cenário hipotético.",
      "Revise conceitos BACnet/Modbus.",
    ]
  ),
  day(
    14,
    2,
    "Cooling redundancy, capacity e PUE",
    "Relacionar capacidade, eficiência, redundância e indicadores sem perder o contexto operacional.",
    ["Cooling Systems", "Energy Efficiency and PUE", "Redundancy"],
    [
      "Explique PUE e limitações de uma comparação sem contexto.",
      "Avalie uma unidade indisponível num cenário.",
      "Faça revisão espaçada da semana 2.",
    ]
  ),
  day(
    15,
    2,
    "Revisão: cooling e monitoramento",
    "Consolidar a cadeia de refrigeração e interpretar alarmes/telemetria.",
    ["Cooling Systems", "BMS, EPMS and DCIM"],
    [
      "Revise respostas incorretas e termos ainda Learning.",
      "Complete o cenário de alta temperatura.",
      "Registre três lacunas para a semana 4.",
    ]
  ),
  day(
    16,
    3,
    "Manutenção e risco operacional",
    "Distinguir manutenção preventiva, preditiva e corretiva no contexto crítico.",
    ["Critical Operations", "Maintenance"],
    [
      "Compare gatilhos e registros esperados.",
      "Liste fatores para uma avaliação de risco.",
      "Não converter a revisão em instrução de execução.",
    ]
  ),
  day(
    17,
    3,
    "LOTO, PPE e permit to work",
    "Reforçar por que autorização, isolamento seguro e PPE dependem de procedimentos aprovados.",
    ["Safety and Procedures"],
    [
      "Releia princípios gerais de LOTO/PPE.",
      "Analise um cenário com condição inesperada.",
      "Pratique dizer em inglês que a atividade deve parar e ser escalonada.",
    ]
  ),
  day(
    18,
    3,
    "SOP, MOP e EOP",
    "Explicar finalidade, aprovação, escopo e diferença entre procedimento padrão, método e emergência.",
    ["Safety and Procedures", "Critical Operations"],
    [
      "Compare SOP/MOP/EOP.",
      "Identifique o que uma revisão/documentação deve esclarecer antes de qualquer trabalho.",
      "Use somente material autorizado pela organização.",
    ]
  ),
  day(
    19,
    3,
    "Mudança, toolbox talk e shift handover",
    "Estruturar comunicação que preserve contexto, riscos e ações pendentes.",
    ["Critical Operations", "Incident Communication"],
    [
      "Rascunhe uma passagem de turno factual.",
      "Inclua status conhecido e incerteza explícita.",
      "Revise change management e toolbox talks.",
    ]
  ),
  day(
    20,
    3,
    "Alarmes, escalonamento e comunicação",
    "Priorizar informações relevantes e informar anomalias com clareza.",
    ["Incident Communication", "BMS, EPMS and DCIM"],
    [
      "Faça um registro hipotético de incidente.",
      "Estruture o que observar, quando, impacto aparente e a quem escalar.",
      "Pratique uma atualização oral em inglês.",
    ]
  ),
  day(
    21,
    3,
    "Fault diagnosis e root cause",
    "Separar sintomas, evidências, hipóteses e conclusão em diagnóstico inicial.",
    ["Fault Diagnosis", "Critical Operations"],
    [
      "Compare causa imediata e root cause.",
      "Analise um alerta de BMS sem assumir perda física do sistema.",
      "Liste evidências adicionais que seriam necessárias.",
    ]
  ),
  day(
    22,
    3,
    "Revisão: segurança e procedimentos",
    "Consolidar linguagem, registros e limites de atuação em cenários críticos.",
    ["Safety and Procedures", "Critical Operations"],
    [
      "Revise LOTO/PPE/SOP/MOP/EOP.",
      "Complete um cenário de manutenção com condição inesperada.",
      "Pratique critérios de escalonamento.",
    ]
  ),
  day(
    23,
    4,
    "Consolidação: power e cooling",
    "Conectar caminhos de energia e remoção de calor numa visão de site.",
    ["Critical Power Systems", "Cooling Systems"],
    [
      "Reveja os dois diagramas simplificados.",
      "Relacione dependências sem presumir arquitetura específica.",
      "Selecione o tópico com maior necessidade de revisão.",
    ]
  ),
  day(
    24,
    4,
    "Assessment técnico e lacunas",
    "Usar desempenho e autoavaliação para escolher revisões com melhor retorno.",
    ["Critical Power Systems", "BMS, EPMS and DCIM", "Fault Diagnosis"],
    [
      "Faça um quiz misto.",
      "Compare confiança e acertos por assunto.",
      "Agende revisão 1/3/7/14 configurável.",
    ]
  ),
  day(
    25,
    4,
    "Scenarios de falha e priorização",
    "Explicar raciocínio, incerteza, segurança e escalonamento.",
    ["Fault Diagnosis", "Safety and Procedures"],
    [
      "Complete dois cenários hipotéticos.",
      "Compare sua resposta com o feedback.",
      "Registre vocabulário novo.",
    ]
  ),
  day(
    26,
    4,
    "Perguntas técnicas de entrevista",
    "Construir respostas claras e verdadeiras para temas de infraestrutura.",
    ["Interview Preparation", "UPS and Battery Systems", "Cooling Systems"],
    [
      "Pratique perguntas técnicas em inglês.",
      "Reescreva respostas com linguagem concisa.",
      "Peça feedback de clareza/vocabulário ao tutor se desejado.",
    ]
  ),
  day(
    27,
    4,
    "Behavioral answers com STAR",
    "Organizar exemplos próprios sem criar fatos ou resultados.",
    ["Interview Preparation", "Critical Operations"],
    [
      "Crie até 4–6 histórias apenas de experiências que você informar.",
      "Separe Situation, Task, Action e Result.",
      "Marque detalhes ainda a confirmar para si mesmo.",
    ]
  ),
  day(
    28,
    4,
    "Technical English e shift handover",
    "Melhorar precisão e naturalidade da comunicação operacional em inglês.",
    ["Interview Vocabulary", "Incident Communication"],
    [
      "Escreva um shift handover curto.",
      "Revise termos com estado Learning/Review required.",
      "Treine uma atualização de incidente.",
    ]
  ),
  day(
    29,
    4,
    "Entrevista simulada e revisão final",
    "Integrar perguntas técnicas, comportamentais e reflexão sobre lacunas.",
    ["Interview Preparation", "Critical Operations"],
    [
      "Faça entrevista simulada com perguntas salvas.",
      "Revise os assuntos de menor confiança.",
      "Não interprete o desempenho como garantia de aprovação.",
    ]
  ),
  day(
    30,
    4,
    "Relatório de 30 dias e próximos passos",
    "Registrar o que foi estudado, revisado e precisa de aprofundamento.",
    ["Critical Power Systems", "Cooling Systems", "Safety and Procedures"],
    [
      "Gere o relatório factual.",
      "Compare autoavaliação inicial/final quando houver dados.",
      "Escolha próximas revisões e conteúdos ainda A confirmar.",
    ]
  ),
];

export interface Topic {
  id: string;
  name: string;
  category: string;
  summary: string;
  prompt: string;
}

export const TOPICS: Topic[] = [
  {
    id: "critical-power",
    name: "Critical Power Systems",
    category: "Electrical Systems",
    summary:
      "Arquitetura, distribuição e monitoramento da alimentação crítica.",
    prompt: "Revisar a arquitetura do caminho de energia e redundância.",
  },
  {
    id: "ups-batteries",
    name: "UPS and Battery Systems",
    category: "Critical Power",
    summary:
      "Modos de operação, bypass, autonomia, alarmes e manutenção de baterias.",
    prompt: "Reforçar modos, dependências e interpretação segura de alarmes.",
  },
  {
    id: "generators",
    name: "Standby Generators",
    category: "Critical Power",
    summary: "Geração standby, interfaces, testes e condições de falha.",
    prompt: "Rever geração standby e comunicação sobre indisponibilidade.",
  },
  {
    id: "hv-lv",
    name: "HV/LV Electrical Systems",
    category: "Electrical Systems",
    summary: "Interfaces de média e baixa tensão, proteção e grounding.",
    prompt: "Consolidar arquitetura HV/LV, proteção e limites de atuação.",
  },
  {
    id: "distribution",
    name: "Electrical Distribution",
    category: "Electrical Systems",
    summary: "Transformers, switchgear, circuit breakers e painéis.",
    prompt: "Traçar distribuição e fronteiras de monitoramento.",
  },
  {
    id: "cooling",
    name: "Cooling Systems",
    category: "Cooling and HVAC",
    summary: "Chillers, chilled water, CRAC/CRAH, airflow e capacidade.",
    prompt: "Rever ciclo de cooling, airflow e redundância.",
  },
  {
    id: "bms",
    name: "BMS, EPMS and DCIM",
    category: "BMS and EPMS",
    summary: "Monitoramento, alarmes, integração e telemetria.",
    prompt:
      "Interpretar alarmes e separar perda de comunicação de falha física.",
  },
  {
    id: "redundancy",
    name: "Redundancy",
    category: "Critical Power",
    summary: "Modelos N, N+1 e 2N, dependências e pontos únicos de falha.",
    prompt: "Comparar N+1/2N e identificar dependências comuns.",
  },
  {
    id: "safety",
    name: "Safety and Procedures",
    category: "Safety",
    summary: "LOTO, PPE, risk assessment e aderência a procedimentos.",
    prompt: "Reforçar segurança, permissões e quando parar/escalar.",
  },
  {
    id: "operations",
    name: "Critical Operations",
    category: "Data Centre Operations",
    summary:
      "SOP/MOP/EOP, manutenção, handover, incidentes e change management.",
    prompt: "Praticar documentação, comunicação e controle operacional.",
  },
  {
    id: "fault-diagnosis",
    name: "Fault Diagnosis",
    category: "Maintenance",
    summary: "Sintomas, evidências, hipóteses, impacto e análise de causa.",
    prompt: "Estruturar hipóteses sem confundir observação e conclusão.",
  },
  {
    id: "pue",
    name: "Energy Efficiency and PUE",
    category: "Energy Efficiency",
    summary: "Eficiência, energia total e contextualização do PUE.",
    prompt: "Revisar PUE e limitações de comparações sem contexto.",
  },
];

export type QuizType =
  | "Multiple choice"
  | "True or False"
  | "Scenario-based question"
  | "Technical definition"
  | "System comparison"
  | "Fault diagnosis"
  | "Short technical answer";
export interface QuizQuestion {
  id: string;
  type: QuizType;
  topicId: string;
  topic: string;
  difficulty: "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  answer?: number;
  expectedKeywords?: string[];
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    type: "System comparison",
    topicId: "redundancy",
    topic: "Redundancy",
    difficulty: "Intermediate",
    prompt: "Qual descrição melhor distingue N+1 de 2N?",
    options: [
      "N+1 fornece um componente de capacidade redundante; 2N prevê dois caminhos/capacidades completos, conforme a arquitetura.",
      "N+1 significa duas redes públicas independentes; 2N significa duas baterias.",
      "Os termos são intercambiáveis e não dependem do desenho do sistema.",
      "2N sempre elimina todo single point of failure, sem exceções.",
    ],
    answer: 0,
    explanation:
      "N+1 acrescenta uma unidade redundante à necessidade N; 2N representa capacidade/caminhos duplicados. A efetiva tolerância depende do projeto e de dependências compartilhadas; não se deve presumir ausência total de SPOF.",
  },
  {
    id: "q2",
    type: "Technical definition",
    topicId: "ups-batteries",
    topic: "UPS and Battery Systems",
    difficulty: "Intermediate",
    prompt: "Em uma arquitetura típica, qual é o objetivo principal da UPS?",
    options: [
      "Dar continuidade à energia condicionada à carga crítica durante perturbações e até a próxima camada disponível.",
      "Substituir indefinidamente o gerador.",
      "Resfriar os racks quando a temperatura aumenta.",
      "Eliminar a necessidade de proteção elétrica.",
    ],
    answer: 0,
    explanation:
      "A UPS mantém qualidade/continuidade da alimentação por um período definido pela arquitetura e pelas condições do sistema; autonomia e resposta dependem do desenho, estado das baterias e procedimentos aprovados.",
  },
  {
    id: "q3",
    type: "System comparison",
    topicId: "ups-batteries",
    topic: "UPS and Battery Systems",
    difficulty: "Advanced",
    prompt:
      "Um alarme de battery string aparece, mas as leituras de saída UPS parecem normais. Qual interpretação é mais adequada?",
    options: [
      "Registrar os dados, avaliar contexto/impacto conforme procedimento local e escalar; o alarme não prova sozinho falha da carga.",
      "Ignorar porque a saída parece normal.",
      "Deduzir que a bateria inteira precisa ser isolada imediatamente.",
      "Anunciar que a autonomia foi confirmada.",
    ],
    answer: 0,
    explanation:
      "A telemetria da saída e o alarme da bateria descrevem aspectos diferentes. Preserve fatos, tendência, equipamento e horário; não conclua autonomia nem prescreva intervenção sem procedimento autorizado.",
  },
  {
    id: "q4",
    type: "True or False",
    topicId: "cooling",
    topic: "Cooling Systems",
    difficulty: "Intermediate",
    prompt:
      "CRAC e CRAH sempre usam o mesmo meio e a mesma arquitetura de rejeição de calor.",
    options: ["Verdadeiro", "Falso"],
    answer: 1,
    explanation:
      "CRAC costuma incluir refrigeração DX e CRAH frequentemente usa chilled water, mas a nomenclatura e o arranjo variam por projeto. Confirme documentação do site/fabricante.",
  },
  {
    id: "q5",
    type: "Fault diagnosis",
    topicId: "bms",
    topic: "BMS, EPMS and DCIM",
    difficulty: "Advanced",
    prompt:
      "O BMS perde comunicação com um sensor enquanto o EPMS continua recebendo dados elétricos. O que os fatos permitem concluir?",
    options: [
      "Há perda de uma via de comunicação/telemetria reportada; isso não confirma, isoladamente, que o equipamento monitorado falhou.",
      "Toda a energia do data center foi perdida.",
      "A medição do sensor permanece válida sem qualquer verificação.",
      "O alarme prova automaticamente falha física do BMS inteiro.",
    ],
    answer: 0,
    explanation:
      "Diferencie perda de telemetria de estado físico do processo, confirme escopo/sistemas afetados e escalone pelos procedimentos de comunicação do local.",
  },
  {
    id: "q6",
    type: "Scenario-based question",
    topicId: "generators",
    topic: "Standby Generators",
    difficulty: "Advanced",
    prompt:
      "Um evento de teste informa que um standby generator não iniciou no resultado esperado. Qual deve ser o foco inicial do relato?",
    options: [
      "Registrar evento, estado observado, impacto conhecido, contexto do teste e escalar conforme o procedimento aprovado.",
      "Tentar repetidamente manobras até o gerador partir.",
      "Assumir que a carga crítica perdeu energia sem verificar evidências.",
      "Alterar os limites de proteção para completar o teste.",
    ],
    answer: 0,
    explanation:
      "O relato deve separar observação e hipótese e priorizar segurança/escalonamento. Este exercício não autoriza diagnóstico físico, mudança de setpoint ou sequência de manobras.",
  },
  {
    id: "q7",
    type: "True or False",
    topicId: "pue",
    topic: "Energy Efficiency and PUE",
    difficulty: "Intermediate",
    prompt:
      "Um único valor de PUE, sem período, carga, metodologia e contexto, basta para comparar a eficiência operacional de dois sites.",
    options: ["Verdadeiro", "Falso"],
    answer: 1,
    explanation:
      "PUE relaciona energia total do data center à energia de TI. A comparação requer período, condições, fronteiras de medição e metodologia consistentes.",
  },
  {
    id: "q8",
    type: "Technical definition",
    topicId: "operations",
    topic: "Safety and Procedures",
    difficulty: "Intermediate",
    prompt: "Qual afirmação descreve melhor a função de SOP, MOP e EOP?",
    options: [
      "São documentos intercambiáveis; a escolha não afeta escopo ou aprovação.",
      "São documentos/procedimentos operacionais distintos cujo escopo e uso devem seguir a governança local aprovada.",
      "Um MOP substitui sempre uma avaliação de risco e uma permissão de trabalho.",
      "Um EOP pode ser improvisado fora dos procedimentos da organização.",
    ],
    answer: 1,
    explanation:
      "As definições e aprovações dependem do sistema de gestão do local. A atividade exige conhecer os procedimentos oficiais; não autoriza executar uma manobra.",
  },
  {
    id: "q9",
    type: "Scenario-based question",
    topicId: "safety",
    topic: "Safety and Procedures",
    difficulty: "Advanced",
    prompt:
      "Durante uma atividade documentada, a condição observada difere do escopo aprovado. Qual resposta é a mais apropriada para este exercício?",
    options: [
      "Pausar/cessar a atividade conforme procedimento, proteger pessoas e infraestrutura, comunicar a condição e obter orientação/aprovação antes de prosseguir.",
      "Continuar porque o documento já está aprovado.",
      "Fazer uma alteração imediata no equipamento e atualizar o registro depois.",
      "Pedir a alguém sem autorização para confirmar a manobra.",
    ],
    answer: 0,
    explanation:
      "Uma condição fora do escopo é motivo para não improvisar: priorize segurança, interrompa de modo seguro quando aplicável e escale segundo processo local.",
  },
  {
    id: "q10",
    type: "Fault diagnosis",
    topicId: "distribution",
    topic: "Electrical Distribution",
    difficulty: "Intermediate",
    prompt:
      "Uma leitura anormal de corrente aparece em um painel, sem interrupção relatada. O que deve constar numa análise inicial?",
    options: [
      "Valor/unidade/horário/fonte/tendência e impacto observado, separando-os de hipóteses e escalonando pelo processo local.",
      "Um diagnóstico definitivo de falha de disjuntor.",
      "Uma instrução para abrir o painel e investigar.",
      "A afirmação de que não há risco porque ainda não houve interrupção.",
    ],
    answer: 0,
    explanation:
      "Uma observação remota não autoriza concluir a causa nem fazer inspeção. Documente evidências e use os controles e profissionais responsáveis.",
  },
  {
    id: "q11",
    type: "System comparison",
    topicId: "bms",
    topic: "BMS, EPMS and DCIM",
    difficulty: "Intermediate",
    prompt: "Qual comparação geral é mais razoável entre BMS, EPMS e DCIM?",
    options: [
      "BMS acompanha sistemas do edifício; EPMS monitora energia elétrica; DCIM oferece visão/inventário/capacidade de infraestrutura de TI/data center — com sobreposições conforme a implementação.",
      "BMS é sempre uma plataforma de entrevistas; EPMS é o HVAC; DCIM é o sistema de proteção.",
      "São sinônimos oficiais com funções idênticas em todos os data centers.",
      "Cada um funciona necessariamente sem sensores ou integração.",
    ],
    answer: 0,
    explanation:
      "Essas definições são aproximações funcionais; soluções e integrações variam. Verifique a arquitetura do site em documentação autorizada.",
  },
  {
    id: "q12",
    type: "True or False",
    topicId: "hv-lv",
    topic: "HV/LV Electrical Systems",
    difficulty: "Intermediate",
    prompt:
      "Concluir um quiz de HV/LV comprova autorização formal para trabalhar em equipamentos energizados.",
    options: ["Verdadeiro", "Falso"],
    answer: 1,
    explanation:
      "Avaliações no aplicativo registram estudo/desempenho. Não concedem autorização, qualificação nem competência operacional certificada.",
  },
];

export interface FailureScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  system: string;
  symptoms: string[];
  information: string[];
  questions: string[];
  feedback: string;
  safety: string[];
  escalation: string[];
  vocabulary: { term: string; meaning: string }[];
}

export const SCENARIOS: FailureScenario[] = [
  {
    id: "ups-alarm",
    title: "UPS Alarm During a Shift",
    description:
      "Durante o turno, o painel indica um alarme de UPS. Ainda não há confirmação de impacto na carga crítica.",
    context:
      "Ocorrência hipotética em um ambiente 24/7, acompanhada por alarmes de monitoramento.",
    system: "UPS and Battery Systems",
    symptoms: [
      "Alarme novo no BMS/EPMS",
      "Indicadores de saída ainda reportados dentro do intervalo observado",
    ],
    information: [
      "Horário do alarme: 02:14",
      "Escopo e causa ainda não confirmados",
      "Sem instruções ou estado de manobra disponíveis",
    ],
    questions: [
      "Quais fatos você registraria primeiro?",
      "O que não é possível concluir apenas com esses dados?",
      "Como comunicaria a condição e a incerteza ao supervisor?",
    ],
    feedback:
      "Uma boa análise separa alarme, leituras e impacto confirmado; registra horário/fonte/equipamento e consulta a hierarquia de escalonamento aprovada. Não deduz condição de bypass, autonomia ou perda de carga sem evidência.",
    safety: [
      "Exercício hipotético — não execute manobras com base neste conteúdo.",
      "Não abra, isole ou opere equipamento; procedimentos e pessoas autorizadas do site prevalecem.",
    ],
    escalation: [
      "Seguir severidade e contatos definidos pela organização.",
      "Escalar imediatamente se o procedimento local ou os fatos indicarem risco/impacto à carga, pessoas ou redundância.",
      "Acionar a equipe responsável quando estado/telemetria estiver inconclusivo.",
    ],
    vocabulary: [
      {
        term: "alarm acknowledgement",
        meaning:
          "reconhecimento do alarme na plataforma, se autorizado pelo procedimento local",
      },
      { term: "critical load", meaning: "carga crítica" },
      { term: "operating state", meaning: "estado operacional informado" },
    ],
  },
  {
    id: "battery-string",
    title: "Battery String Alarm",
    description:
      "Um alarme de string de bateria aparece durante uma revisão de rotina; a saída reportada da UPS não mostra desvio evidente.",
    context:
      "Alarme único em telemetry; não há inspeção física nem diagnóstico confirmado.",
    system: "Battery Systems",
    symptoms: [
      "Alarme associado a um battery string",
      "Tendência completa ainda indisponível",
    ],
    information: [
      "Outra via de medição continua reportando dados",
      "Autonomia real não foi avaliada",
      "Procedimentos locais não foram anexados",
    ],
    questions: [
      "Como distinguir observação de hipótese?",
      "Que dados autorizados podem contextualizar o relato?",
      "Qual informação deve ser escalonada?",
    ],
    feedback:
      "Registre o identificador disponível, horário, fonte e leituras/tendências fornecidas por sistemas aprovados. A saída aparente não comprova estado das baterias nem autonomia.",
    safety: [
      "Não toque em terminais nem realize ensaios com base na simulação.",
      "Qualquer inspeção/teste depende de pessoal, risco e procedimento autorizado.",
    ],
    escalation: [
      "Acione a resposta definida para o alarme pela organização.",
      "Peça avaliação a profissional responsável; não defina nível de serviço com dados incompletos.",
    ],
    vocabulary: [
      { term: "battery string", meaning: "string/conjunto de baterias" },
      { term: "state of charge", meaning: "estado de carga" },
      { term: "trend", meaning: "tendência temporal" },
    ],
  },
  {
    id: "generator-fail",
    title: "Standby Generator Start Failure",
    description:
      "O resultado informado de um teste agendado indica que um gerador standby não iniciou conforme esperado.",
    context:
      "Cenário simulado após uma atividade planejada; status final e impacto no site precisam de confirmação pelos responsáveis.",
    system: "Standby Generators",
    symptoms: [
      "Registro reporta start failure",
      "Escopo de equipamentos afetados não confirmado",
    ],
    information: [
      "Existe um registro de teste",
      "Não há dados de combustível, alarmes detalhados ou carga neste exercício",
    ],
    questions: [
      "Quais fatos fariam parte de um incident report?",
      "Como você comunicaria resultado e incerteza?",
      "O que deve ser deixado a cargo de equipe autorizada?",
    ],
    feedback:
      "Preserve o resultado e o contexto do teste; não infira falha de toda a geração nem proponha repetição/tentativas. Verificação técnica segue método aprovado e responsável designado.",
    safety: [
      "Não tente partida, transferência ou operação manual por conta própria.",
      "Manobras/diagnóstico dependem da autorização, MOP/EOP aplicável e responsáveis do local.",
    ],
    escalation: [
      "Informe a equipe de plantão/supervisor segundo rota oficial.",
      "Registre impacto confirmado versus desconhecido e a próxima revisão aprovada.",
    ],
    vocabulary: [
      { term: "start failure", meaning: "falha de partida reportada" },
      { term: "load bank test", meaning: "ensaio de carga com banco de carga" },
      { term: "standby capacity", meaning: "capacidade de reserva" },
    ],
  },
  {
    id: "high-temp",
    title: "High Temperature Alarm in a Server Room",
    description:
      "Um alerta de temperatura aparece no monitoramento de uma zona enquanto unidades de cooling reportam estados diferentes.",
    context:
      "Uma sala segue ocupada; não se conhece neste exercício a tendência completa nem a configuração de redundância.",
    system: "Cooling Systems and BMS",
    symptoms: [
      "Alarme em uma zona",
      "Dois sensores não reportam valores idênticos",
      "Status de unidades aparece misto",
    ],
    information: [
      "Dados são amostras da telemetria",
      "Não há confirmação de risco imediato ou falha mecânica",
      "O limite e a escalada seguem os padrões do site",
    ],
    questions: [
      "Como descrever a divergência dos sensores?",
      "Que contexto da telemetria é útil para escalar?",
      "Como evitar afirmar causa sem confirmação?",
    ],
    feedback:
      "Compare horários, zona, localização, unidades e tendência conforme as ferramentas aprovadas; trate telemetria conflitante como incerteza. Não ajuste setpoints nem prometa impacto zero.",
    safety: [
      "Não altere controles/temperaturas nem acesse área restrita por causa deste exercício.",
      "A resposta real deve seguir alarm thresholds e processo de incidente do site.",
    ],
    escalation: [
      "Use o limite e a cadeia de escalonamento da organização.",
      "Escalar se tendência, severidade ou procedimento indicar risco à continuidade/segurança.",
      "Solicitar análise por equipe de facilities autorizada.",
    ],
    vocabulary: [
      { term: "hot spot", meaning: "ponto de temperatura elevada" },
      { term: "airflow management", meaning: "gestão do fluxo de ar" },
      { term: "sensor discrepancy", meaning: "divergência entre sensores" },
    ],
  },
  {
    id: "telemetry-loss",
    title: "Loss of BMS Communication",
    description:
      "O dashboard deixa de receber atualizações de alguns pontos; outra plataforma ainda apresenta dados para outros equipamentos.",
    context: "Falha de comunicação limitada ou de escopo ainda desconhecido.",
    system: "BMS, EPMS and DCIM",
    symptoms: [
      "Pontos com timestamp antigo",
      "A tela informa communication loss",
      "Dados em outra origem continuam disponíveis",
    ],
    information: [
      "Não há evidência de perda de energia",
      "Estado físico dos pontos sem telemetria é desconhecido",
      "Não há confirmação da rede/integração",
    ],
    questions: [
      "Quais pontos e períodos precisam ser identificados?",
      "Que conclusões seriam prematuras?",
      "Como anotar estado desconhecido sem assumir estado seguro?",
    ],
    feedback:
      "Perda de comunicação comprova ausência/atraso de dado, não o estado físico do sistema. Identifique escopo, timestamp, fonte e equipe de escalonamento antes de qualquer conclusão.",
    safety: [
      "Não use status stale como confirmação de estado seguro.",
      "Não altere rede, sensores ou equipamento sem autorização.",
    ],
    escalation: [
      "Reportar pontos e duração pelo processo de alarmes.",
      "Acionar a equipe BMS/IT/facilities conforme propriedade definida pelo local.",
      "Se monitoramento alternativo também estiver comprometido, explicitar a lacuna de visibilidade.",
    ],
    vocabulary: [
      { term: "stale data", meaning: "dados desatualizados" },
      { term: "telemetry gap", meaning: "lacuna de telemetria" },
      { term: "communication loss", meaning: "perda de comunicação" },
    ],
  },
];

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  help: string;
  keywords: string[];
}
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "intro",
    category: "Professional background",
    question:
      "Could you briefly describe your experience in critical facilities operations?",
    help: "Apresente apenas experiências reais, seu escopo e como você trabalha com segurança.",
    keywords: ["background", "critical facilities", "maintenance"],
  },
  {
    id: "power-path",
    category: "Electrical Maintenance",
    question: "How would you explain the critical power path in a data centre?",
    help: "Estruture a explicação em blocos e sinalize que a arquitetura depende do site.",
    keywords: ["power path", "distribution", "redundancy"],
  },
  {
    id: "ups",
    category: "UPS Systems",
    question: "What information would you consider when reviewing a UPS alarm?",
    help: "Separe fato, impacto confirmado, tendência, procedimento e escalonamento; não descreva manobras.",
    keywords: ["UPS", "alarm", "evidence"],
  },
  {
    id: "battery",
    category: "Battery Systems",
    question:
      "What is the role of battery monitoring in a critical power environment?",
    help: "Explique monitoramento e limitações de inferir autonomia sem dados/testes aprovados.",
    keywords: ["battery", "monitoring", "autonomy"],
  },
  {
    id: "generator",
    category: "Standby Generators",
    question:
      "What would you include in a report after an unsuccessful generator test?",
    help: "Contexto, registros, resultado reportado, impacto confirmado, incerteza e rota de escalonamento.",
    keywords: ["generator", "test", "incident report"],
  },
  {
    id: "cooling",
    category: "Cooling Systems",
    question:
      "How would you describe the difference between CRAC and CRAH units?",
    help: "Compare funções gerais e confirme arquitetura do local, já que implementações variam.",
    keywords: ["CRAC", "CRAH", "cooling"],
  },
  {
    id: "alarms",
    category: "BMS and EPMS",
    question:
      "How do you prioritise alarms when monitoring several systems on shift?",
    help: "Relate severidade aprovada, pessoas/impacto, confiabilidade dos dados e comunicação.",
    keywords: ["alarms", "prioritisation", "shift"],
  },
  {
    id: "safety",
    category: "LOTO and Electrical Safety",
    question:
      "What would you do if site conditions differ from an approved method of procedure?",
    help: "Priorize segurança, não improvisar, interromper de forma segura quando apropriado e escalar pelo processo local.",
    keywords: ["safety", "MOP", "escalation"],
  },
  {
    id: "handover",
    category: "Shift Handover",
    question: "What makes a shift handover clear and useful?",
    help: "Status, horário, fonte, impacto conhecido, pendências, riscos e responsável; sem suposições.",
    keywords: ["handover", "communication", "records"],
  },
  {
    id: "star",
    category: "Problem Solving",
    question:
      "Tell me about a time you improved a maintenance or operational process.",
    help: "Use uma situação verdadeira e estruture Situation, Task, Action e Result. Se não tiver exemplo confirmado, deixe a resposta em branco.",
    keywords: ["STAR", "improvement", "real example"],
  },
];

export interface VocabularyTerm {
  id: string;
  term: string;
  meaning: string;
  definition: string;
  example: string;
  category: string;
}
export const VOCABULARY: VocabularyTerm[] = [
  {
    id: "critical-load",
    term: "critical load",
    meaning: "carga crítica",
    definition:
      "Carga cuja alimentação contínua é importante para a operação do data center.",
    example: "The critical load remained within the reported operating range.",
    category: "Critical Power",
  },
  {
    id: "single-point",
    term: "single point of failure",
    meaning: "ponto único de falha",
    definition:
      "Elemento cuja falha pode interromper uma função sem alternativa efetiva, conforme a arquitetura.",
    example: "We reviewed the diagram for potential single points of failure.",
    category: "Critical Power",
  },
  {
    id: "power-path",
    term: "power path",
    meaning: "caminho de energia",
    definition: "Sequência de componentes que conduz energia da fonte à carga.",
    example: "Could you walk me through the critical power path?",
    category: "Electrical Systems",
  },
  {
    id: "switchgear",
    term: "switchgear",
    meaning: "conjunto de manobra e proteção",
    definition:
      "Conjunto de dispositivos associados à proteção e distribuição elétrica; implementação depende do equipamento e do site.",
    example: "The switchgear alarm was escalated according to site procedure.",
    category: "Electrical Systems",
  },
  {
    id: "bypass",
    term: "bypass",
    meaning: "desvio/contorno elétrico (conforme contexto)",
    definition:
      "Caminho alternativo previsto na arquitetura do equipamento; seus estados e uso devem ser interpretados na documentação aplicável.",
    example:
      "The reported bypass status was checked against the approved documentation.",
    category: "UPS and Batteries",
  },
  {
    id: "battery-string",
    term: "battery string",
    meaning: "string/conjunto de baterias",
    definition:
      "Grupo de baterias conectado conforme a arquitetura e a configuração do sistema.",
    example: "The battery string alarm was recorded for further review.",
    category: "UPS and Batteries",
  },
  {
    id: "load-bank",
    term: "load bank test",
    meaning: "teste com banco de carga",
    definition:
      "Ensaio controlado de equipamento de geração usando carga artificial, realizado segundo documentação e processo autorizados.",
    example: "The load bank test outcome was added to the maintenance record.",
    category: "Generators",
  },
  {
    id: "standby",
    term: "standby generator",
    meaning: "gerador de reserva/standby",
    definition:
      "Gerador destinado a fornecer suporte quando previsto pela arquitetura e pelas condições aprovadas.",
    example: "The standby generator test was reported as unsuccessful.",
    category: "Generators",
  },
  {
    id: "chilled-water",
    term: "chilled water system",
    meaning: "sistema de água gelada",
    definition:
      "Circuito que distribui água resfriada para unidades de tratamento/remoção de calor.",
    example: "The CRAH units are connected to the chilled water system.",
    category: "Cooling and HVAC",
  },
  {
    id: "airflow",
    term: "airflow management",
    meaning: "gestão do fluxo de ar",
    definition:
      "Organização do movimento de ar para reduzir mistura/recirculação e apoiar o controle térmico.",
    example: "Airflow management can influence inlet temperatures.",
    category: "Cooling and HVAC",
  },
  {
    id: "hot-aisle",
    term: "hot aisle containment",
    meaning: "contenção de corredor quente",
    definition:
      "Arranjo que contém o ar quente de exaustão em área designada, de acordo com o layout.",
    example: "We reviewed the hot aisle containment layout.",
    category: "Cooling and HVAC",
  },
  {
    id: "heat-load",
    term: "cooling capacity",
    meaning: "capacidade de refrigeração",
    definition:
      "Capacidade disponível para remover calor sob condições e limites especificados.",
    example:
      "The reported cooling capacity was reviewed with the operations team.",
    category: "Cooling and HVAC",
  },
  {
    id: "monitoring",
    term: "alarm monitoring",
    meaning: "monitoramento de alarmes",
    definition:
      "Acompanhamento e tratamento de indicações conforme severidade, responsabilidade e procedimento local.",
    example: "Alarm monitoring continues throughout the shift.",
    category: "BMS and EPMS",
  },
  {
    id: "stale",
    term: "stale data",
    meaning: "dado desatualizado",
    definition:
      "Dado cujo timestamp ou atualização não representa necessariamente o estado atual.",
    example: "The dashboard was showing stale data for two sensors.",
    category: "BMS and EPMS",
  },
  {
    id: "telemetry",
    term: "telemetry gap",
    meaning: "lacuna de telemetria",
    definition:
      "Intervalo ou conjunto de sinais ausentes/desatualizados no sistema de monitoramento.",
    example:
      "We reported a telemetry gap rather than assuming the equipment had failed.",
    category: "BMS and EPMS",
  },
  {
    id: "pue",
    term: "Power Usage Effectiveness (PUE)",
    meaning: "eficácia no uso de energia",
    definition:
      "Razão entre a energia total do data center e a energia de equipamentos de TI, segundo fronteiras de medição definidas.",
    example:
      "The PUE figure should be interpreted with its measurement period and methodology.",
    category: "Energy Efficiency",
  },
  {
    id: "n-plus-one",
    term: "N+1 redundancy",
    meaning: "redundância N+1",
    definition:
      "Capacidade N requerida mais um elemento redundante, sujeita à topologia e dependências do projeto.",
    example:
      "We discussed what the N+1 arrangement covers and what it does not.",
    category: "Critical Power",
  },
  {
    id: "2n",
    term: "2N architecture",
    meaning: "arquitetura 2N",
    definition:
      "Arranjo com duas capacidades/caminhos completos conforme definido pelo projeto, sem presumir independência total.",
    example:
      "A 2N label alone does not prove there are no shared dependencies.",
    category: "Critical Power",
  },
  {
    id: "root-cause",
    term: "root cause analysis",
    meaning: "análise de causa raiz",
    definition:
      "Método de investigação estruturada de fatores que levaram a um evento, apoiado por evidências.",
    example:
      "The root cause analysis separated confirmed facts from working hypotheses.",
    category: "Maintenance",
  },
  {
    id: "preventive",
    term: "preventive maintenance",
    meaning: "manutenção preventiva",
    definition:
      "Trabalho planejado com objetivo de reduzir probabilidade de falha, realizado sob processo autorizado.",
    example:
      "Preventive maintenance records were updated after the planned task.",
    category: "Maintenance",
  },
  {
    id: "predictive",
    term: "predictive maintenance",
    meaning: "manutenção preditiva",
    definition:
      "Abordagem que usa dados/tendências para antecipar necessidade de manutenção.",
    example: "Predictive maintenance may use condition-monitoring trends.",
    category: "Maintenance",
  },
  {
    id: "corrective",
    term: "corrective maintenance",
    meaning: "manutenção corretiva",
    definition:
      "Atividade executada para corrigir uma condição identificada, conforme avaliação/permite local.",
    example: "The corrective maintenance request was escalated for approval.",
    category: "Maintenance",
  },
  {
    id: "loto",
    term: "Lockout/Tagout (LOTO)",
    meaning: "bloqueio e etiquetagem",
    definition:
      "Controles formais de segurança para perigosas fontes de energia conforme legislação, formação e procedimento local.",
    example:
      "The LOTO process must follow the organisation's approved procedure.",
    category: "Safety",
  },
  {
    id: "ppe",
    term: "Personal Protective Equipment (PPE)",
    meaning: "equipamento de proteção individual",
    definition:
      "Equipamentos selecionados conforme a avaliação de risco e as regras aplicáveis.",
    example: "PPE requirements were confirmed before the authorised activity.",
    category: "Safety",
  },
  {
    id: "risk",
    term: "risk assessment",
    meaning: "avaliação de risco",
    definition:
      "Identificação e tratamento formal de riscos por responsáveis competentes antes/durante a atividade.",
    example:
      "The unexpected condition required the risk assessment to be reviewed.",
    category: "Safety",
  },
  {
    id: "sop",
    term: "Standard Operating Procedure (SOP)",
    meaning: "procedimento operacional padrão",
    definition:
      "Documento que descreve operação rotineira conforme governança e aprovação da organização.",
    example: "The SOP was reviewed before the routine task.",
    category: "Safety",
  },
  {
    id: "mop",
    term: "Method of Procedure (MOP)",
    meaning: "método de procedimento",
    definition:
      "Plano aprovado para uma atividade definida; escopo e exigências variam conforme o site.",
    example:
      "The activity was paused when conditions differed from the approved MOP.",
    category: "Safety",
  },
  {
    id: "eop",
    term: "Emergency Operating Procedure (EOP)",
    meaning: "procedimento operacional de emergência",
    definition:
      "Orientação institucional para responder a condições de emergência segundo o sistema de gestão do site.",
    example: "The team followed the site's EOP and escalation process.",
    category: "Safety",
  },
  {
    id: "shift-handover",
    term: "shift handover",
    meaning: "passagem de turno",
    definition:
      "Transferência estruturada de status, atividades, riscos, eventos e pendências entre equipes.",
    example:
      "The shift handover included open alarms and the next review owner.",
    category: "Data Centre Operations",
  },
  {
    id: "permit",
    term: "permit to work",
    meaning: "permissão de trabalho",
    definition:
      "Autorização formal para atividades sob condições, escopo e controles estabelecidos pela organização.",
    example: "The permit to work remained subject to site approval.",
    category: "Safety",
  },
  {
    id: "incident-report",
    term: "incident report",
    meaning: "relatório de incidente",
    definition:
      "Registro factual de evento, horários, evidências, impacto, ações aprovadas e acompanhamento.",
    example:
      "The incident report distinguished observed facts from assumptions.",
    category: "Incident Management",
  },
  {
    id: "escalation",
    term: "escalation path",
    meaning: "rota de escalonamento",
    definition:
      "Cadeia formal de contatos/decisões para elevar um evento ao responsável apropriado.",
    example:
      "The escalation path was followed according to the site's procedure.",
    category: "Incident Management",
  },
  {
    id: "change-management",
    term: "change management",
    meaning: "gestão de mudanças",
    definition:
      "Processo para avaliar, aprovar, planejar e documentar alterações em ambiente operacional.",
    example:
      "The change management record included the approved scope and review outcome.",
    category: "Data Centre Operations",
  },
];

export interface CourseItem {
  id: string;
  title: string;
  modules?: string;
  platform: string;
  url: string;
  description: string;
  topic: string;
  startDate: string;
  completionDate: string;
  estimatedHours: string;
  actualHours: number;
  status: "Not started" | "In progress" | "Completed";
  certificate:
    | "Not applicable"
    | "Not started"
    | "In progress"
    | "Issued"
    | "To be verified";
  notes: string;
  officialDetails: string;
}

export const INITIAL_COURSES: CourseItem[] = [
  {
    id: "course-schneider-fundamentals",
    title: "Data Center Fundamentals",
    platform: "Schneider Electric University",
    url: "",
    description:
      "Conteúdo sugerido para revisar fundamentos da infraestrutura de data centers.",
    topic: "Critical Power Systems",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar título, disponibilidade, duração e condições diretamente na plataforma.",
  },
  {
    id: "course-schneider-capacity",
    title: "Power and Cooling Capacity Management",
    platform: "Schneider Electric University",
    url: "",
    description: "Conteúdo sugerido sobre capacidade de energia e cooling.",
    topic: "Critical Power Systems",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar título, disponibilidade, duração e condições diretamente na plataforma.",
  },
  {
    id: "course-schneider-redundancy",
    title: "Power Redundancy",
    platform: "Schneider Electric University",
    url: "",
    description:
      "Conteúdo sugerido para rever conceitos de redundância de energia.",
    topic: "Redundancy",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar se existe curso/módulo com este título oficial.",
  },
  {
    id: "course-schneider-efficiency",
    title: "Efficiency and Monitoring",
    platform: "Schneider Electric University",
    url: "",
    description:
      "Conteúdo sugerido sobre monitoramento e eficiência operacional.",
    topic: "BMS, EPMS and DCIM",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar se existe curso/módulo com este título oficial.",
  },
  {
    id: "course-schneider-dcca",
    title: "DCCA Learning Path",
    platform: "Schneider Electric University",
    url: "",
    description:
      "Trilha de aprendizagem sugerida no prompt, condicionada à disponibilidade.",
    topic: "Critical Facilities Operations",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar disponibilidade e condições; não representa certificação.",
  },
  {
    id: "course-edwartens-power",
    title: "Data Centre Electrical and Critical Power",
    platform: "EDWartens",
    url: "",
    description:
      "Revisão sugerida de distribuição, UPS e infraestrutura elétrica crítica.",
    topic: "Critical Power Systems",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar título e disponibilidade diretamente na plataforma.",
  },
  {
    id: "course-edwartens-cooling",
    title: "Data Centre Cooling, BMS and DCIM",
    platform: "EDWartens",
    url: "",
    description:
      "Revisão sugerida de cooling de precisão, monitoramento e DCIM.",
    topic: "Cooling Systems",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar título e disponibilidade diretamente na plataforma.",
  },
  {
    id: "course-rackready-infrastructure",
    title: "Critical Infrastructure Track",
    platform: "RackReady",
    url: "",
    description:
      "Trilha sugerida de infraestrutura crítica; módulos e formato a confirmar.",
    topic: "Critical Facilities Operations",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar disponibilidade e título oficial na plataforma.",
  },
  {
    id: "course-rackready-safety",
    title: "Safety & Procedures",
    platform: "RackReady",
    url: "",
    description: "Conteúdo sugerido sobre segurança e procedimentos.",
    topic: "Safety and Procedures",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "To be verified — confirmar disponibilidade e título oficial na plataforma.",
  },
  {
    id: "course-hvac-states",
    title: "HVAC Thermodynamic States",
    platform: "To be verified",
    url: "",
    description: "Módulo sugerido para estados termodinâmicos de HVAC.",
    topic: "Cooling Systems",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "A plataforma/módulo correspondente ainda não foi identificada; pesquisar antes de tratar como curso oficial.",
  },
  {
    id: "course-bms",
    title: "Building Management Systems",
    platform: "To be verified",
    url: "",
    description: "Módulo sugerido para aprofundar sistemas de gestão predial.",
    topic: "BMS, EPMS and DCIM",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "A plataforma/módulo correspondente ainda não foi identificada; pesquisar antes de tratar como curso oficial.",
  },
  {
    id: "course-density",
    title: "High-Density Power Distribution",
    platform: "To be verified",
    url: "",
    description:
      "Conteúdo sugerido relacionado à distribuição elétrica para maior densidade.",
    topic: "Electrical Distribution",
    startDate: "",
    completionDate: "",
    estimatedHours: "",
    actualHours: 0,
    status: "Not started",
    certificate: "To be verified",
    notes: "",
    officialDetails:
      "Plataforma, título oficial e disponibilidade a confirmar.",
  },
];

export const STATUS_LABELS: Record<string, string> = {
  "Not started": "Não iniciado",
  "In progress": "Em andamento",
  Completed: "Concluído",
  "Review required": "Revisão necessária",
  Skipped: "Adiado/pulado",
  Beginner: "Iniciante",
  Basic: "Básico",
  Intermediate: "Intermediário",
  Advanced: "Avançado",
  "Practical experience": "Experiência prática",
  New: "Novo",
  Learning: "Aprendendo",
  Familiar: "Familiar",
  Confident: "Confiante",
};

TOPICS.push(...EXTRA_TOPICS);
QUIZ_QUESTIONS.push(...EXTRA_QUIZ_QUESTIONS);
SCENARIOS.push(...EXTRA_SCENARIOS);
INTERVIEW_QUESTIONS.push(...EXTRA_INTERVIEW_QUESTIONS);
