# CFT Study Companion

Aplicativo pessoal de acompanhamento de estudos para **Critical Facilities
Technician (CFT)** — revisão e aprofundamento técnico de infraestrutura
crítica de data centers, com foco em operações na Irlanda.

- Interface e explicações em **português brasileiro**; títulos oficiais de
  cursos e termos técnicos em **inglês**.
- Plano de **30 dias** (~1–1,5 h/dia): Critical Power → Cooling/BMS/DCIM →
  Operations/Safety → Consolidação/Entrevistas.
- Ferramenta de **estudo educacional**: não confere certificação,
  competência operacional, emprego ou aprovação em entrevistas.

## Requisitos

- Node.js 20+ e npm (o projeto usa `pnpm-lock.yaml`, mas instala com npm;
  sem pnpm instalado, use o comando abaixo).

## Como rodar localmente

```bash
npm install --legacy-peer-deps   # peer dep legada do plugin jsx-loc
npm run dev                      # servidor em http://localhost:3000
```

Outros comandos:

```bash
npm run check        # TypeScript (tsc --noEmit)
npm test             # vitest
npm run build        # build cliente (dist/public) + servidor (dist)
npm run start        # serve a build de produção (PORT=3000)
```

## Deploy no Netlify (site estático)

Sim — este repositório publica no Netlify via `netlify.toml` (build
`pnpm build:static`, pasta `dist/public`, redirect SPA `/* → /index.html`).

1. Suba o repo para o GitHub/GitLab e conecte em **Add new site → Import
   an existing project** (as Build settings vêm do `netlify.toml`).
2. Deploy automático a cada `git push` na branch principal.
3. Sem variáveis de ambiente obrigatórias.

Limites do deploy estático: o servidor Express/tRPC **não** roda no
Netlify, então o tutor e o feedback de entrevistas usam o **modo offline
no navegador** (`shared/tutorFallback.ts`, já embutido no bundle) — todo o
restante (plano de 30 dias, quizzes, cenários, relatório, backup) funciona
igual ao ambiente local. Para o tutor online com IA, hospede o backend
(`npm run build` + `npm run start`) em serviço Node (ex.: Render/Fly/Railway)
e aponte o cliente para a API.

## Ativar IA gratuita no tutor

Sem nenhuma chave, o tutor responde em modo offline (orientação local).
Para respostas de IA de verdade, sem pagar nada, escolha uma via
(o servidor tenta nesta ordem: gerenciada → Gemini → Ollama → offline):

**Opção 1 — Google Gemini (nuvem, cota gratuita):**
1. Gere uma chave em https://aistudio.google.com/apikey
2. Crie um `.env` na raiz (use `.env.example` de modelo) com
   `GEMINI_API_KEY=sua-chave` e rode `npm run dev`

**Opção 2 — Ollama (local, 100% grátis, funciona offline):**
1. Instale https://ollama.com e baixe um modelo: `ollama pull llama3.1:8b`
2. Rode `ollama serve` e depois `npm run dev` (padrão já aponta para
   `http://localhost:11434`; ajuste via `OLLAMA_HOST`/`OLLAMA_MODEL`)
3. Respostas locais costumam levar dezenas de segundos — aguarde o
   indicador “pensando”

A etiqueta no topo do tutor mostra a origem: IA GERENCIADA, IA · GEMINI,
IA · OLLAMA ou MODO OFFLINE. Chaves ficam só no servidor (`.env` está no
`.gitignore` — nunca faça commit delas).

## Tutor técnico (IA)

- Com o serviço de IA gerenciado configurado no servidor, as respostas vêm
  da IA com instruções de segurança (sem manobras reais, sem inventar fatos).
- **Sem créditos/chave/rede, o tutor continua funcional em modo offline**:
  o servidor gera orientação educacional local (`server/tutorFallback.ts`,
  com testes em `server/tutorFallback.test.ts`) e a interface exibe o aviso
  “modo offline”. O mesmo vale para o feedback de entrevistas.
- As chaves nunca vão para o navegador; só as mensagens enviadas no chat
  chegam ao servidor.

## Dados e privacidade

- Progresso, notas, respostas e preferências ficam no **localStorage deste
  navegador** (sem login, sem sincronização entre dispositivos).
- Exporte/restaure backup JSON em **Configurações → Portabilidade**.
- Evite registrar dados confidenciais do empregador ou de sites reais.

## Estrutura

- `client/src/components/cft/` — Painel, Plano, Tópicos, Questionários,
  Cenários, Tutor, Entrevistas, Vocabulário, Notas, Relatório, Cursos.
- `client/src/lib/study-data*.ts` — cronograma de 30 dias, temas, quizzes,
  cenários hipotéticos, perguntas de entrevista, glossário e cursos
  (detalhes oficiais marcados “To be verified / A confirmar”).
- `client/src/lib/study-store.tsx` — estado + persistência local.
- `server/routers.ts` — API tRPC (`tutor.ask` com fallback offline).
- `client/public/app-routes.json` — manifesto de páginas.
