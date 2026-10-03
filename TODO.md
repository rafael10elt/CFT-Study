# Acompanhamento — CFT Study Companion

Verificação local em 2026-10-03 (Node 24, npm): `tsc --noEmit` OK,
`vitest` 11/11 OK, `vite build` + `npm run build` OK, servidor de produção
testado em runtime (`/api/health` → `{"status":"ok"}`; `tutor.ask` sem IA
retorna fallback offline com `offline:true`).

- [x] **Dashboard e Study Plan:** Painel (`DashboardPage.tsx`) com progresso
  geral, dias concluídos/restantes, horas estudadas/planejadas, gráfico por
  semana (recharts), revisões pendentes, média de quizzes, recomendações
  explicáveis e próxima atividade. Cronograma de 30 dias (`INITIAL_DAYS`,
  30 entradas em 4 semanas) com objetivo, atividades, tempo, 5 status,
  notas, data de conclusão, reorder/reagendamento sem apagar histórico
  (`study-store.tsx`: `updateDay`/`moveDay` + `activityHistory`).

- [x] **Knowledge Assessment, quizzes e avaliações:** autoavaliação por tema
  (Beginner/Basic/Intermediate/Advanced/Practical experience, marcada como
  autoavaliação) em `KnowledgePage`; `QuizPage` com Multiple choice,
  True/False, Scenario-based, Technical definition, System comparison,
  Fault diagnosis e Short technical answer (correção por palavras-chave);
  resultado com pontuação, explicação por questão e geração de revisão dos
  erros. Sem rótulo de prova oficial.

- [x] **AI Technical Tutor e Failure Scenarios:** `tutor.ask` (tRPC,
  servidor, rate-limit 12/min) com prompt de segurança; **fallback offline**
  (`server/tutorFallback.ts` + 5 testes) quando a IA gerenciada está
  indisponível — respostas locais PT-BR, sem manobras, sem inventar fatos,
  com aviso "modo offline" na UI (`TutorPage`, `InterviewPage`). 12
  cenários (`SCENARIOS` + `EXTRA_SCENARIOS`) com título EN, descrição PT,
  contexto, sintomas, perguntas, feedback, segurança, escalonamento e
  vocabulário; nenhum ensina switching/isolação/reenergização.
  IA gratuita: cadeia gerenciada → Gemini (`server/aiProviders.ts`,
  7 testes) → Ollama local → fallback offline; origem exibida na UI;
  E2E validado com Ollama simulado (`provider: ollama`, `offline: false`).

- [x] **Interview Preparation, Technical English, Study Notes e Courses:**
  10+ perguntas EN por categoria com ajuda PT, resposta EN salva, feedback
  de IA (só usa fatos do texto) e método STAR sem inventar experiência;
  glossário bilíngue (termo, tradução, definição, exemplo, categoria) com
  níveis New/Learning/Familiar/Confident/Review required; notas por
  tema/curso/dia com favoritos; cursos com todos os campos do prompt,
  CRUD completo e “To be verified / A confirmar” (12 cursos iniciais).

- [x] **Revisão inteligente e recomendações:** intervalos 1/3/7/14
  ajustáveis (`SettingsPage`), concluir/adiar/imediata, dificuldade
  fácil/médio/difícil, histórico; pendências no dashboard com priorização;
  recomendações adaptativas com motivo (UPS, cooling, BMS, N+1/2N, inglês,
  segurança); comparação com vagas reais (`JobComparisonPanel`) sem
  pontuação de empregabilidade ou promessa de contratação.

- [x] **Acompanhamento e relatório factual:** métricas por semana/tema/
  período, evolução da autoavaliação, distinção estudado × revisado ×
  desempenho × experiência × certificação; `ReportPage` factual baseado nos
  dados registrados, com aviso de que não valida competência/certificação/
  empregabilidade.

- [x] **Idioma, interface, segurança e integridade:** UI PT-BR, títulos
  oficiais e termos técnicos em EN, entrevistas praticadas em EN; 12 menus
  em português, layout responsivo com cartões/indicadores/gráficos;
  avisos de segurança e anti-fabricação em todas as páginas sensíveis.

- [ ] **Privacidade, persistência e publicação online:** localStorage sem
  login/sem sincronização (avisado em Configurações e no tutor),
  exportar **e restaurar** backup JSON, `tsc`/rota `/api/health`/
  `app-routes.json`/build validados. **Deploy:** `netlify.toml` adicionado
  (estático: `pnpm build:static` → `dist/public`, SPA redirect, sem env
  obrigatória; tutor em modo offline no navegador, bundle verificado com o
  fallback embutido e `dist/public` testado via servidor estático local).
  **Pendente:** conectar o repo no Netlify e confirmar a URL pública
  (ação do usuário no painel). Não declarar o app “online” até validar a
  resposta pública da versão publicada.
