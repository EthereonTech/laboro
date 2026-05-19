# CLAUDE.md — Laboro

Este arquivo é o contexto completo do projeto Laboro para o Claude Code.
Leia este arquivo inteiro antes de qualquer tarefa. Nunca assuma algo que não esteja aqui documentado.

---

## O que é o Laboro

Laboro é um marketplace de trabalho por turno desenvolvido pela Ethereon Tech (Pato Branco, PR).
Conecta trabalhadores freelancers (garçons, bartenders, promotores, auxiliares) com empresas que precisam de mão de obra por diária ou turno.

**Diferencial central:** pagamento garantido via escrow com Pix. O valor do turno é retido antes do trabalho e liberado automaticamente após confirmação de check-out. Nenhuma outra plataforma brasileira faz isso.

**Referência de produto:** Instawork (instawork.com) — estudar os fluxos antes de implementar qualquer feature.

**Concorrente principal:** estaff (estaff.com.br) — resolve 61,5% das reclamações em 8 dias. Nosso diferencial é suporte em 24h, escrow, score transparente e multi-setor.

**Mercado inicial:** Pato Branco, PR → Curitiba → São Paulo.

---

## Stack técnica — não alterar sem discussão

```
Backend:       Node.js 20 + TypeScript + Fastify
ORM:           Prisma
Banco:         PostgreSQL via Supabase
Cache/Filas:   Redis (Upstash) + BullMQ
Pagamentos:    Asaas (Pix, split, transferências)
Geoloc:        Google Maps Platform (Geocoding + Distance)
Auth:          Supabase Auth + JWT (access 15min + refresh 30d)
Storage:       Supabase Storage (fotos, documentos)
Push:          Expo Push Notifications + Firebase FCM
WhatsApp:      Z-API (alertas críticos)
SMS:           Twilio (OTP)
Deploy:        Railway
CI/CD:         GitHub Actions
Monitoramento: Sentry (erros) + Logtail (logs)
Frontend:      React Native + Expo
```

---

## Estrutura do monorepo

```
laboro/
├── CLAUDE.md                  ← este arquivo
├── apps/
│   ├── api/                   ← backend Fastify
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── workers/
│   │   │   │   ├── businesses/
│   │   │   │   ├── shifts/
│   │   │   │   ├── checkin/
│   │   │   │   ├── payments/
│   │   │   │   ├── ratings/
│   │   │   │   └── notifications/
│   │   │   ├── jobs/          ← BullMQ workers
│   │   │   ├── lib/           ← clients (asaas, redis, maps, zapi)
│   │   │   ├── middlewares/
│   │   │   ├── plugins/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── worker-app/            ← app do trabalhador (React Native)
│   └── business-app/          ← app da empresa (React Native)
├── packages/
│   ├── types/                 ← tipos TypeScript compartilhados
│   └── utils/                 ← funções utilitárias (haversine, formatters)
└── package.json               ← workspace root
```

---

## Schema do banco de dados (Prisma)

### Regras gerais
- Toda tabela tem: `id UUID PK`, `created_at`, `updated_at`, `deleted_at` (soft delete)
- Nunca usar DELETE físico em dados financeiros — sempre soft delete
- Transações financeiras (escrow) devem usar transações ACID explícitas via Prisma `$transaction`

### Tabelas principais

```prisma
model User {
  id          String    @id @default(uuid())
  phone       String    @unique
  type        UserType  // worker | business
  full_name   String
  cpf         String?   @unique
  photo_url   String?
  is_verified Boolean   @default(false)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?
  worker      Worker?
  business    Business?
}

model Worker {
  id               String    @id @default(uuid())
  user_id          String    @unique
  user             User      @relation(fields: [user_id], references: [id])
  pix_key          String?
  pix_key_type     PixKeyType? // cpf | phone | email | cnpj | random
  score            Decimal   @default(0) @db.Decimal(3, 2)
  total_shifts     Int       @default(0)
  on_time_rate     Decimal   @default(0) @db.Decimal(5, 2)
  level            WorkerLevel @default(BEGINNER) // BEGINNER | VERIFIED | TOP_PRO
  asaas_customer_id String?
  specialties      WorkerSpecialty[]
  applications     ShiftApplication[]
  ratings_received Rating[]  @relation("RatingsToWorker")
}

model Business {
  id                String   @id @default(uuid())
  user_id           String   @unique
  user              User     @relation(fields: [user_id], references: [id])
  cnpj              String   @unique
  trade_name        String
  legal_name        String
  segment           BusinessSegment // bar | restaurante | evento | hotel | varejo | saude | logistica | outro
  address           Json     // { street, number, neighborhood, city, state, zip, lat, lng }
  asaas_customer_id String?
  score             Decimal  @default(0) @db.Decimal(3, 2)
  shifts            Shift[]
  favorites         BusinessFavorite[]
}

model Shift {
  id             String      @id @default(uuid())
  business_id    String
  business       Business    @relation(fields: [business_id], references: [id])
  specialty      Specialty   // garcom | bartender | aux_cozinha | promotor | caixa | repositor | cuidador | aux_logistica
  starts_at      DateTime
  ends_at        DateTime
  slots          Int         @default(1)
  rate_per_hour  Decimal     @db.Decimal(10, 2)
  total_value    Decimal     @db.Decimal(10, 2)  // calculado: horas * rate_per_hour * slots
  laboro_fee     Decimal     @db.Decimal(10, 2)  // 18% do total_value
  instructions   String?
  status         ShiftStatus @default(OPEN) // OPEN | FILLED | IN_PROGRESS | DONE | CANCELLED
  address        Json?       // se diferente do endereço da empresa
  is_urgent      Boolean     @default(false)
  applications   ShiftApplication[]
  escrow         EscrowTransaction[]
}

model ShiftApplication {
  id           String            @id @default(uuid())
  shift_id     String
  shift        Shift             @relation(fields: [shift_id], references: [id])
  worker_id    String
  worker       Worker            @relation(fields: [worker_id], references: [id])
  status       ApplicationStatus @default(PENDING) // PENDING | CONFIRMED | CANCELLED | NO_SHOW | COMPLETED
  checkin_at   DateTime?
  checkin_lat  Decimal?          @db.Decimal(10, 7)
  checkin_lng  Decimal?          @db.Decimal(10, 7)
  checkout_at  DateTime?
  hours_worked Decimal?          @db.Decimal(5, 2)
  created_at   DateTime          @default(now())
  updated_at   DateTime          @updatedAt
  @@unique([shift_id, worker_id])
}

model EscrowTransaction {
  id                  String          @id @default(uuid())
  shift_id            String
  shift               Shift           @relation(fields: [shift_id], references: [id])
  worker_id           String
  business_id         String
  gross_amount        Decimal         @db.Decimal(10, 2)  // cobrado da empresa
  laboro_fee          Decimal         @db.Decimal(10, 2)  // comissão Laboro
  worker_amount       Decimal         @db.Decimal(10, 2)  // repassado ao trabalhador
  status              EscrowStatus    @default(RESERVED)  // RESERVED | CONFIRMED | RELEASED | REFUNDED | FAILED
  asaas_payment_id    String?         // ID da cobrança no Asaas
  asaas_transfer_id   String?         // ID da transferência no Asaas
  idempotency_key     String          @unique             // prevenir duplicatas
  reserved_at         DateTime?
  confirmed_at        DateTime?
  released_at         DateTime?
  refunded_at         DateTime?
  created_at          DateTime        @default(now())
  updated_at          DateTime        @updatedAt
}

model Rating {
  id        String   @id @default(uuid())
  shift_id  String
  from_id   String
  to_id     String
  to_worker Worker?  @relation("RatingsToWorker", fields: [to_id], references: [id])
  score     Int      // 1 a 5
  tags      String[] // pontual | boa_apresentacao | trabalhou_bem | voltaria | nao_voltaria | atrasou | sumiu
  comment   String?
  created_at DateTime @default(now())
  @@unique([shift_id, from_id])
}
```

---

## Módulos do backend — responsabilidades

### auth/
- OTP por SMS via Twilio (6 dígitos, TTL 5min no Redis)
- JWT access token (15min) + refresh token (30d no Redis)
- Middleware `authenticate` para rotas protegidas
- Middleware `requireWorker` e `requireBusiness` para separar permissões

### workers/
- CRUD do perfil do trabalhador
- Upload de foto via Supabase Storage
- Gestão de especialidades e disponibilidade semanal
- Score calculado automaticamente após cada avaliação recebida
- Lógica de nível: BEGINNER (0–4 turnos) | VERIFIED (5+) | TOP_PRO (20+ E score ≥ 4.5 E on_time_rate ≥ 90%)

### businesses/
- CRUD do perfil da empresa
- Validação de CNPJ na API pública da Receita Federal
- Gestão de trabalhadores favoritos

### shifts/
- CRUD de vagas com validação de negócio
- Listagem com filtro geoespacial (Haversine via Google Maps)
- Fluxo: OPEN → candidatura → FILLED → IN_PROGRESS → DONE | CANCELLED
- Slot management: decrementar slots disponíveis ao confirmar trabalhador

### checkin/
- Validar presença por GPS (raio 500m, Haversine)
- Se precisão do GPS > 100m: aceitar com warning, não rejeitar
- Registrar checkin_at e checkout_at na ShiftApplication
- Calcular hours_worked no checkout
- Disparar job de liberação de escrow via BullMQ

### payments/
- Integração completa com Asaas
- Fluxo de escrow: reservar → confirmar via webhook → liberar → repassar Pix
- Webhook com verificação de assinatura Asaas
- Idempotency key em toda operação financeira
- Retry automático no repasse: 3x com backoff (10min, 30min, 2h)
- Rollback garantido: nenhum centavo pode ficar sem estado definido

### ratings/
- Avaliação bidirecional só após turno concluído (status COMPLETED)
- Recalcular score do trabalhador após cada avaliação (média ponderada)
- Peso 2x para as 5 avaliações mais recentes
- Atualizar nível (level) após recalcular

### notifications/
- Push via Expo SDK + FCM
- WhatsApp via Z-API para alertas críticos
- Fallback: se push falhar, tentar WhatsApp; se falhar, SMS
- Eventos obrigatórios com notificação:
  - Nova vaga compatível com especialidade do trabalhador
  - Turno confirmado (trabalhador e empresa)
  - Lembrete 2h antes do turno
  - Check-in do trabalhador confirmado (empresa)
  - Pagamento liberado (trabalhador)
  - Avaliação pendente (2h após turno)
  - Vaga sem candidatos a 4h do início (empresa)

---

## Jobs BullMQ — filas e responsabilidades

```
notifications-queue   → envio de push, WhatsApp, SMS
escrow-queue          → liberação de pagamento pós-checkout, retry em falha
score-queue           → recalcular score e nível do trabalhador
shift-queue           → alertas de vaga sem candidatos, lembrete de turno
cleanup-queue         → expirar OTPs, limpar tokens inválidos
```

Regras para todos os jobs:
- Sempre logar início, sucesso e falha com contexto (shift_id, worker_id, amount)
- Jobs financeiros têm retry máximo de 3, depois alertar suporte
- Nunca processar job duplicado (usar jobId único baseado em entidade + evento)

---

## Fluxo de escrow — passo a passo obrigatório

```
1. Empresa confirma trabalhador
   → POST /shifts/:id/confirm/:workerId
   → Criar EscrowTransaction (status: RESERVED)
   → Criar cobrança Pix no Asaas com idempotency_key
   → Enviar QR Code Pix para empresa via push + WhatsApp

2. Empresa paga o Pix
   → Webhook Asaas: PAYMENT_CONFIRMED
   → Verificar assinatura do webhook
   → Atualizar EscrowTransaction (status: CONFIRMED, confirmed_at)
   → Notificar trabalhador: "Pagamento garantido para seu turno"

3. Pix não pago em 30 minutos
   → BullMQ job agendado no passo 1
   → Asaas.cancelPayment
   → EscrowTransaction (status: FAILED)
   → Notificar empresa, liberar slot da vaga

4. Trabalhador faz check-in
   → POST /shifts/:id/checkin com { lat, lng }
   → Calcular distância até endereço da vaga
   → Se > 500m: retornar erro 422 com mensagem clara
   → Se GPS impreciso (accuracy > 100m): aceitar com flag warning
   → Registrar checkin_at, atualizar ShiftApplication

5. Trabalhador faz check-out
   → POST /shifts/:id/checkout
   → Calcular hours_worked
   → Atualizar ShiftApplication (status: COMPLETED)
   → Disparar escrow-queue job: liberar pagamento

6. Liberação do pagamento (BullMQ job)
   → Asaas.createTransfer({ pixKey: worker.pix_key, value: worker_amount })
   → Atualizar EscrowTransaction (status: RELEASED, released_at)
   → Push + WhatsApp para trabalhador: "R$ X.XX liberado para sua chave Pix"
   → Agendar score-queue job
   → Agendar notifications-queue job: avaliação pendente (2h depois)

7. Falha no repasse
   → Retry 1: 10 minutos
   → Retry 2: 30 minutos
   → Retry 3: 2 horas
   → Se 3 falhas: EscrowTransaction (status: FAILED), alertar suporte via Sentry

8. No-show reportado pela empresa
   → POST /shifts/:id/report-noshow/:workerId
   → ShiftApplication (status: NO_SHOW)
   → Asaas.refundPayment (estornar 100% para empresa)
   → EscrowTransaction (status: REFUNDED)
   → Penalizar score do trabalhador: -0.5
   → Suspender acesso a novas vagas por 48h
   → Notificar trabalhador com motivo

9. Empresa cancela vaga com trabalhador confirmado
   → Política: grátis se > 24h; taxa de 10% se < 24h; sem reembolso se < 4h
   → Asaas.refundPayment (parcial ou total conforme política)
   → Notificar trabalhador
```

---

## Regras de negócio — críticas

### Cálculo de valor da vaga
```typescript
const hours = (ends_at - starts_at) / 3600000
const total_value = hours * rate_per_hour * slots
const laboro_fee = total_value * 0.18
const worker_amount = total_value - laboro_fee
// gross_amount cobrado da empresa = total_value (fee embutida)
// Invariante: gross_amount === laboro_fee + worker_amount (sempre verificar)
```

### Cálculo de score do trabalhador
```typescript
// Média ponderada: últimas 5 avaliações têm peso 2, demais peso 1
const recentRatings = ratings.slice(-5)  // últimas 5
const olderRatings = ratings.slice(0, -5)
const weightedSum = recentRatings.reduce((acc, r) => acc + r.score * 2, 0)
                  + olderRatings.reduce((acc, r) => acc + r.score * 1, 0)
const totalWeight = recentRatings.length * 2 + olderRatings.length * 1
const score = totalWeight > 0 ? weightedSum / totalWeight : 0
```

### Validação de GPS (Haversine)
```typescript
function haversineDistance(lat1, lng1, lat2, lng2): number {
  const R = 6371000 // metros
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
// Usar: se haversineDistance(workerLat, workerLng, shiftLat, shiftLng) > 500 → rejeitar
```

### Nível do trabalhador
```typescript
function calculateLevel(worker: Worker): WorkerLevel {
  if (worker.total_shifts >= 20 && worker.score >= 4.5 && worker.on_time_rate >= 90) {
    return 'TOP_PRO'
  }
  if (worker.total_shifts >= 5) return 'VERIFIED'
  return 'BEGINNER'
}
```

---

## Convenções de código

### Estrutura de módulo
Cada módulo em `src/modules/{nome}/` deve ter:
```
{nome}.routes.ts      ← definição das rotas Fastify
{nome}.service.ts     ← lógica de negócio
{nome}.schema.ts      ← schemas Zod para validação de input/output
{nome}.repository.ts  ← queries Prisma (sem lógica de negócio)
{nome}.types.ts       ← tipos TypeScript do módulo
```

### Padrão de resposta da API
```typescript
// Sucesso
{ data: T, meta?: { total, page, limit } }

// Erro
{ error: { code: string, message: string, details?: any } }
```

### Códigos de erro padronizados
```
AUTH_INVALID_OTP        → OTP inválido ou expirado
AUTH_TOO_MANY_ATTEMPTS  → Rate limit de OTP atingido
SHIFT_NOT_FOUND         → Vaga não encontrada
SHIFT_ALREADY_APPLIED   → Trabalhador já se candidatou
SHIFT_FULL              → Todos os slots preenchidos
CHECKIN_TOO_FAR         → Trabalhador fora do raio de 500m
CHECKIN_ALREADY_DONE    → Check-in já realizado
PAYMENT_FAILED          → Falha no processamento do pagamento
ESCROW_NOT_CONFIRMED    → Escrow ainda não confirmado pelo banco
WORKER_SUSPENDED        → Trabalhador suspenso (no-show recente)
```

### Logs estruturados (Logtail)
```typescript
logger.info({
  event: 'escrow.released',
  shift_id: shift.id,
  worker_id: worker.id,
  amount: worker_amount,
  asaas_transfer_id: transfer.id
})
// Nunca logar: CPF completo, chave Pix completa, dados de cartão
// CPF nos logs: mascarar para ***.***.XXX-XX (mostrar só últimos 3 dígitos)
```

### Segurança obrigatória
- Rate limit: 100 req/min por IP, 20 req/min por usuário autenticado
- Validar schema Zod em TODA rota (input e output)
- Sanitizar todos os campos de texto livre (strip HTML)
- Webhook Asaas: sempre verificar assinatura antes de processar
- CNPJ: validar na Receita Federal antes de criar empresa
- CPF: validar algoritmo de dígito verificador antes de salvar

---

## Roadmap de implementação — 16 semanas

### Fase 1 — Fundação (Semanas 1–3)
**Objetivo:** infraestrutura base, autenticação e perfis funcionando

Semana 1:
- [ ] Setup monorepo: Node 20 + TypeScript + Fastify + Prisma + Supabase
- [ ] Schema inicial Prisma: users, workers, businesses, worker_specialties
- [ ] Estrutura de pastas dos módulos
- [ ] Health check endpoint + Swagger configurado
- [ ] Redis (Upstash) conectado

Semana 2:
- [ ] Módulo auth: OTP por SMS (Twilio) com TTL 5min no Redis
- [ ] Módulo auth: JWT access (15min) + refresh token (30d)
- [ ] Middleware authenticate, requireWorker, requireBusiness
- [ ] Frontend: splash, seleção de tipo, input telefone, tela OTP

Semana 3:
- [ ] CRUD completo perfil do trabalhador + upload foto (Supabase Storage)
- [ ] CRUD completo perfil da empresa + validação CNPJ Receita Federal
- [ ] Frontend: fluxo de cadastro trabalhador (4 etapas)
- [ ] Frontend: fluxo de cadastro empresa (3 etapas)
- [ ] Testes de integração: auth + perfis (cobertura ≥ 80%)

**Critério de saída:** criar conta → login → cadastro completo funciona sem erro

---

### Fase 2 — Core do marketplace (Semanas 4–6)
**Objetivo:** vagas, candidaturas e matching geoespacial

Semana 4:
- [ ] Schema: shifts + shift_applications com todos os estados
- [ ] CRUD de vagas (empresa): criar, editar, cancelar com validações
- [ ] Listagem de vagas com filtro geoespacial (Haversine + Google Maps Geocoding)
- [ ] Redis + BullMQ: setup das filas e worker process

Semana 5:
- [ ] POST /shifts/:id/apply — candidatura com validações
- [ ] POST /shifts/:id/confirm/:workerId — confirmação pela empresa
- [ ] Cancelamento com regras de negócio (24h / 4h)
- [ ] Frontend: home do trabalhador + card de vaga + filtros
- [ ] Frontend: detalhe da vaga + fluxo de candidatura

Semana 6:
- [ ] Frontend: home da empresa + dashboard + postar vaga
- [ ] Frontend: lista de candidatos com confirmação
- [ ] BullMQ job: alerta de vaga sem candidatos a 4h do início
- [ ] Testes: fluxo completo empresa cria → trabalhador se candidata → confirmação

**Critério de saída:** empresa cria vaga, trabalhador vê e se candidata, empresa confirma

---

### Fase 3 — Escrow (Semanas 7–10)
**Objetivo:** pagamento garantido end-to-end funcionando

Semana 7:
- [ ] Conta Asaas sandbox configurada com subconta para split
- [ ] Criar customer Asaas no cadastro de empresa e trabalhador
- [ ] Schema: escrow_transactions com todos os estados e idempotency_key

Semana 8:
- [ ] Reserva de escrow ao confirmar trabalhador (criar cobrança Pix Asaas)
- [ ] Webhook Asaas: verificar assinatura + processar PAYMENT_CONFIRMED
- [ ] Job: expirar Pix não pago em 30min → cancelar + notificar
- [ ] Check-in com validação de GPS (Haversine, raio 500m)

Semana 9:
- [ ] Check-out com cálculo de hours_worked
- [ ] BullMQ job: liberar escrow → Asaas.createTransfer → Pix para trabalhador
- [ ] Retry automático no repasse: 3x com backoff (10min, 30min, 2h)
- [ ] Rollback: no-show e cancelamento com estorno total ou parcial
- [ ] Frontend: telas de check-in e check-out com animação de pagamento

Semana 10:
- [ ] Frontend: histórico de pagamentos (trabalhador e empresa)
- [ ] Testes de carga: simular falhas de Pix, no-show, cancelamento tardio
- [ ] Auditoria: verificar gross_amount = laboro_fee + worker_amount em 100% dos casos
- [ ] Testar em sandbox com Pix real antes de ir para produção

**Critério de saída:** R$ entram da empresa, ficam retidos, R$ saem para o trabalhador após checkout — sem erro

---

### Fase 4 — Score, avaliações e notificações (Semanas 11–13)
**Objetivo:** confiabilidade e engajamento

Semana 11:
- [ ] Schema: ratings com tags e soft unique por (shift_id, from_id)
- [ ] API de avaliação bidirecional (só após turno COMPLETED)
- [ ] Cálculo de score com média ponderada (peso 2x últimas 5 avaliações)
- [ ] Lógica de nível: BEGINNER | VERIFIED | TOP_PRO
- [ ] Frontend: tela de avaliação pós-turno (empresa avalia trabalhador)

Semana 12:
- [ ] Frontend: perfil público do trabalhador com score e histórico
- [ ] Frontend: trabalhador avalia empresa
- [ ] Expo Push + Firebase FCM configurados
- [ ] BullMQ jobs de notificação: nova vaga, lembrete turno, pagamento liberado, avaliação pendente

Semana 13:
- [ ] Z-API configurada para WhatsApp (alertas críticos)
- [ ] Fallback: push → WhatsApp → SMS
- [ ] Frontend: centro de notificações + preferências de canal
- [ ] Frontend: equipe favorita da empresa
- [ ] Testes: score com 10 avaliações variadas, push em dispositivo Android real

**Critério de saída:** trabalhador recebe avaliação, score atualiza, nível muda, push chega no celular

---

### Fase 5 — Piloto e hardening (Semanas 14–16)
**Objetivo:** em produção com clientes reais em Pato Branco

Semana 14:
- [ ] GitHub Actions: lint + testes + build + deploy automático no Railway
- [ ] Sentry configurado com alertas para erros de pagamento
- [ ] Logtail com logs estruturados e CPF mascarado
- [ ] Publicar apps no Google Play (prioridade) e App Store via Expo EAS
- [ ] Onboarding manual dos 3 pilotos em Pato Branco

Semana 15:
- [ ] Rate limiting: 100 req/min por IP, 20 req/min por usuário
- [ ] Validação Zod em todas as rotas (input + output)
- [ ] Validação de CNPJ na Receita Federal no cadastro
- [ ] LGPD: política de privacidade, direito de exclusão, anonimização de CPF em logs
- [ ] Monitorar pilotos: entrevistar trabalhadores e empresas após cada turno

Semana 16:
- [ ] Corrigir todos os bugs encontrados nos pilotos
- [ ] Medir métricas: taxa de no-show, tempo de preenchimento, NPS, receita
- [ ] Dashboard admin interno: ver transações, resolver disputas, suspender usuários
- [ ] Decisão com base nos dados: expandir para Curitiba se NPS > 7 dos dois lados

**Critério de saída:** 3 pilotos ativos, pelo menos 10 transações reais, primeiro R$ de receita

---

## Variáveis de ambiente necessárias

```env
# Banco
DATABASE_URL=
DIRECT_URL=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Redis
REDIS_URL=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# Twilio (OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Asaas (pagamentos)
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3  # trocar para produção

# Google Maps
GOOGLE_MAPS_API_KEY=

# Z-API (WhatsApp)
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=

# Expo Push
EXPO_ACCESS_TOKEN=

# Firebase FCM
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Sentry
SENTRY_DSN=

# Logtail
LOGTAIL_TOKEN=

# App
NODE_ENV=development
PORT=3000
APP_URL=https://api.laboro.com.br
```

---

## Como trabalhar com Claude Code neste projeto

### Ao iniciar uma nova sessão
1. Claude Code lê este arquivo automaticamente
2. Pergunte em qual fase e tarefa estamos antes de implementar qualquer coisa
3. Verifique se as dependências da tarefa estão concluídas antes de começar

### Ao implementar um endpoint
1. Criar o schema Zod em `{modulo}.schema.ts`
2. Criar o repositório em `{modulo}.repository.ts` (só queries Prisma)
3. Criar o service em `{modulo}.service.ts` (lógica de negócio)
4. Registrar a rota em `{modulo}.routes.ts`
5. Escrever teste de integração

### Ao implementar lógica financeira
1. Sempre usar `prisma.$transaction` para operações que envolvem escrow
2. Sempre gerar idempotency_key antes de chamar o Asaas
3. Sempre logar início, sucesso e falha do job com contexto completo
4. Nunca retornar dados financeiros sem verificar que o usuário tem permissão

### Nunca fazer sem discussão
- Alterar a stack técnica definida
- Modificar o schema de EscrowTransaction
- Remover verificação de assinatura do webhook Asaas
- Fazer DELETE físico em qualquer tabela financeira
- Logar CPF, chave Pix ou dados de cartão completos

---

*Laboro — Ethereon Tech | Pato Branco, PR | 2026*
*Versão deste arquivo: 1.0 | Atualizar ao concluir cada fase*