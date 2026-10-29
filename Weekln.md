# Weekln

Esqueleto completo do projeto em um único arquivo: visão geral, regras, arquitetura e o **código de todos os arquivos**.
Serve para recriar o projeto em um computador sem acesso ao git.

## Visão geral

Cada pessoa registra como está na **segunda** e como espera estar na **sexta** (1 a 3 palavras + foto opcional).
As respostas aparecem em um carousel, usado para apresentar durante a semana.

**Stack:** React + TypeScript (Vite), Supabase (Postgres, Auth, Storage), Vercel.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Envio e edição (no dia do envio) |
| `/apresentacao` | Carousel da semana (← → e espaço) |
| `/admin` | Login, edição, exclusão e histórico de edições |

## Regras de negócio

- Sem login para os usuários: nome em texto livre e sessão guardada no cache do navegador (`localStorage`).
- Um envio por sessão por semana; segunda e sexta são enviadas juntas.
- Palavras: 1 a 3 por momento, separadas por vírgula. Foto opcional por momento.
- Foto: só PNG, JPG ou WEBP, até 5 MB (validado no front-end e no bucket).
- Se o envio falhar depois do upload, a foto enviada é removida do storage.
- Usuário comum edita só no dia do envio; depois disso, só o admin.
- Admin = usuário do Supabase Auth. Toda edição gera log: texto mostra "de X para Y"; foto mostra só "foto alterada".

## Arquitetura

Fluxo: `pages` → `hooks` → `services` (via interfaces) → Supabase.
Componentes não chamam services; hooks dependem só das interfaces.

```
weekln/
  .env.example
  .gitignore
  README.md
  index.html
  package.json
  src/
    App.tsx
    components/
      admin/
        EnviosTable.tsx
        LinhaEnvio.tsx
        LogList.tsx
        LoginForm.tsx
        PainelAdmin.tsx
      carousel/
        SlideSentimento.tsx
      common/
        Marca.tsx
        SemanaSelect.tsx
      form/
        MomentoFieldset.tsx
    config/
      constants.ts
      env.ts
      supabase.ts
    hooks/
      useAdminPainel.ts
      useAuth.ts
      useCarousel.ts
      useEnviosDaSemana.ts
      useFormularioEnvio.ts
      useSemanas.ts
    main.tsx
    pages/
      AdminPage.tsx
      ApresentacaoPage.tsx
      EnvioPage.tsx
    services/
      AdminSentimentoService.ts
      AuthService.ts
      LogService.ts
      SentimentoService.ts
      SessaoLocalService.ts
      StorageService.ts
      index.ts
      interfaces/
        IAdminSentimentoService.ts
        IAuthService.ts
        ILogService.ts
        ISentimentoService.ts
        ISessaoService.ts
        IStorageService.ts
    styles/
      apresentacao.css
      global.css
    types/
      auth.ts
      sentimento.ts
    utils/
      arquivo.ts
      erro.ts
      palavras.ts
      semana.ts
      tom.ts
      uploadTransacional.ts
    vite-env.d.ts
  supabase/
    schema.sql
  tsconfig.json
  vercel.json
  vite.config.ts
```

## Como montar

### Opção A: automática (recomendada)

1. Crie uma pasta e dentro dela o arquivo `extrair.mjs` com o código abaixo.
2. Coloque este `Weekln.md` na mesma pasta.
3. Rode `node extrair.mjs Weekln.md weekln` (precisa do Node 18 ou superior).

````js
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [, , arquivo = 'Weekln.md', destino = 'weekln'] = process.argv;
const texto = readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n');
const padrao = /^### `([^`]+)`\n````[a-z]*\n([\s\S]*?)\n````$/gm;

let total = 0;
for (const [, caminho, conteudo] of texto.matchAll(padrao)) {
  const saida = join(destino, caminho);
  mkdirSync(dirname(saida), { recursive: true });
  writeFileSync(saida, conteudo + '\n');
  total++;
}
console.log(`${total} arquivos criados em ${destino}/`);
````

### Opção B: manual

Para cada seção `### \`caminho\`` abaixo, crie o arquivo no caminho indicado e cole o conteúdo do bloco de código.

## Depois de montar

1. `cd weekln && npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (pode ser a publishable key `sb_publishable_...`).
3. No Supabase, abra o SQL Editor e rode `supabase/schema.sql`.
4. Em Authentication > Users, crie o usuário admin (Auto Confirm User) e depois desative novos cadastros (Sign In / Providers > Email).
5. `npm run dev` para testar; `npm run build` para gerar a versão final.
6. Deploy na Vercel: variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; o `vercel.json` já trata as rotas.

## Arquivos

### `package.json`
````json
{
  "name": "weekln",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
````

### `tsconfig.json`
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
````

### `vite.config.ts`
````ts
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
````

### `index.html`
````html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#2f4bff" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <title>Weekln</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

### `vercel.json`
````json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
````

### `.env.example`
````text
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON
````

### `.gitignore`
````text
node_modules
dist
.env
.env.local
````

### `README.md`
````md
# Weekln

Cada pessoa registra como está na segunda e como espera estar na sexta (até 3 palavras + foto opcional).
As respostas são exibidas em um carousel durante a semana.

**Stack:** React + TypeScript (Vite), Supabase (Postgres, Auth, Storage), Vercel.

## Rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Rode `supabase/schema.sql` no SQL Editor do Supabase
4. Em Authentication, crie o usuário admin e desative signups
5. `npm run dev`

## Rotas

| Rota            | Descrição                                   |
| --------------- | ------------------------------------------- |
| `/`             | Envio e edição (no dia) do sentimento       |
| `/apresentacao` | Carousel da semana (← → e espaço)           |
| `/admin`        | Login, edição, exclusão e log de edições    |

## Arquitetura

```
src/
├── config/        env, cliente Supabase, constantes
├── types/         modelos de dados (Envio, LogEdicao, ...)
├── utils/         funções puras (semana, palavras, erro)
├── services/
│   ├── interfaces/  contratos (ISentimentoService, IAuthService, ...)
│   ├── *.ts         implementações com Supabase
│   └── index.ts     composição: instâncias tipadas pelas interfaces
├── hooks/         estado e regras de tela (useFormularioEnvio, useCarousel, ...)
├── components/    UI sem acesso a dados (common, form, carousel, admin)
├── pages/         telas ligadas às rotas
└── styles/        CSS
```

Fluxo: `pages` → `hooks` → `services (interfaces)` → Supabase.
Componentes não chamam services; hooks só dependem das interfaces.

## Regras de acesso (no banco)

- Leitura pública pela view `sentimentos_publico` (sem `session_id`)
- Envio e edição de usuários via funções RPC; edição só do dono da sessão e no dia do envio
- Admin = usuário autenticado; trigger registra o log ("de X para Y"; foto: só "foto alterada")
````

### `supabase/schema.sql`
````sql
create extension if not exists pgcrypto;

-- 1 a 3 palavras separadas por vírgula ou espaço
create or replace function public.max_3_palavras(t text)
returns boolean language sql immutable as $$
  select cardinality(array_remove(regexp_split_to_array(trim(t), '[,\s]+'), '')) between 1 and 3
$$;

create table public.sentimentos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  nome text not null check (char_length(trim(nome)) between 1 and 80),
  semana date not null, -- data da segunda-feira
  palavras_segunda text not null check (public.max_3_palavras(palavras_segunda)),
  foto_segunda_url text,
  palavras_sexta text not null check (public.max_3_palavras(palavras_sexta)),
  foto_sexta_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (session_id, semana)
);

create table public.sentimentos_log (
  id uuid primary key default gen_random_uuid(),
  sentimento_id uuid not null,
  campo text not null,
  valor_anterior text, -- null para fotos (só registra que mudou)
  valor_novo text,
  editado_por text not null check (editado_por in ('usuario', 'admin')),
  editado_em timestamptz not null default now()
);

-- Leitura pública sem expor session_id
create view public.sentimentos_publico as
  select id, nome, semana, palavras_segunda, foto_segunda_url,
         palavras_sexta, foto_sexta_url, criado_em, atualizado_em
  from public.sentimentos;

-- Log automático de edições (usuário ou admin)
create or replace function public.log_edicao()
returns trigger language plpgsql security definer as $$
declare quem text := case when auth.uid() is null then 'usuario' else 'admin' end;
begin
  if new.nome is distinct from old.nome then
    insert into public.sentimentos_log (sentimento_id, campo, valor_anterior, valor_novo, editado_por)
    values (new.id, 'nome', old.nome, new.nome, quem);
  end if;
  if new.palavras_segunda is distinct from old.palavras_segunda then
    insert into public.sentimentos_log (sentimento_id, campo, valor_anterior, valor_novo, editado_por)
    values (new.id, 'palavras_segunda', old.palavras_segunda, new.palavras_segunda, quem);
  end if;
  if new.palavras_sexta is distinct from old.palavras_sexta then
    insert into public.sentimentos_log (sentimento_id, campo, valor_anterior, valor_novo, editado_por)
    values (new.id, 'palavras_sexta', old.palavras_sexta, new.palavras_sexta, quem);
  end if;
  if new.foto_segunda_url is distinct from old.foto_segunda_url then
    insert into public.sentimentos_log (sentimento_id, campo, editado_por)
    values (new.id, 'foto_segunda', quem);
  end if;
  if new.foto_sexta_url is distinct from old.foto_sexta_url then
    insert into public.sentimentos_log (sentimento_id, campo, editado_por)
    values (new.id, 'foto_sexta', quem);
  end if;
  new.atualizado_em := now();
  return new;
end $$;

create trigger trg_log_edicao before update on public.sentimentos
  for each row execute function public.log_edicao();

-- RPC: enviar
create or replace function public.enviar_sentimento(
  p_session uuid, p_nome text, p_semana date,
  p_pal_seg text, p_foto_seg text, p_pal_sex text, p_foto_sex text
) returns uuid language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into public.sentimentos
    (session_id, nome, semana, palavras_segunda, foto_segunda_url, palavras_sexta, foto_sexta_url)
  values (p_session, p_nome, p_semana, p_pal_seg, p_foto_seg, p_pal_sex, p_foto_sex)
  returning id into v_id;
  return v_id;
end $$;

-- RPC: editar (só o dono da sessão, só no mesmo dia do envio)
create or replace function public.editar_sentimento(
  p_session uuid, p_id uuid, p_nome text,
  p_pal_seg text, p_foto_seg text, p_pal_sex text, p_foto_sex text
) returns void language plpgsql security definer as $$
declare v public.sentimentos;
begin
  select * into v from public.sentimentos where id = p_id and session_id = p_session;
  if not found then raise exception 'Envio não encontrado para esta sessão'; end if;
  if (v.criado_em at time zone 'America/Sao_Paulo')::date
     <> (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Edição permitida apenas no dia do envio';
  end if;
  update public.sentimentos set
    nome = p_nome,
    palavras_segunda = p_pal_seg, foto_segunda_url = p_foto_seg,
    palavras_sexta = p_pal_sex, foto_sexta_url = p_foto_sex
  where id = p_id;
end $$;

-- RPC: envio da própria sessão na semana
create or replace function public.meu_envio(p_session uuid, p_semana date)
returns setof public.sentimentos language sql security definer as $$
  select * from public.sentimentos where session_id = p_session and semana = p_semana
$$;

-- Permissões
alter table public.sentimentos enable row level security;
alter table public.sentimentos_log enable row level security;

revoke all on public.sentimentos, public.sentimentos_log from anon;
grant select on public.sentimentos_publico to anon, authenticated;
grant execute on function public.enviar_sentimento, public.editar_sentimento, public.meu_envio to anon, authenticated;

-- Admin = usuário autenticado (crie só o seu e desative signups no Supabase)
create policy admin_all on public.sentimentos for all to authenticated using (true) with check (true);
create policy admin_log on public.sentimentos_log for select to authenticated using (true);

-- Storage: só PNG, JPG e WEBP, até 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy fotos_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'fotos');

-- Rollback de upload (quando o envio falha): só arquivos dos últimos 10 minutos
create policy fotos_select_recentes on storage.objects for select to anon, authenticated
  using (bucket_id = 'fotos' and created_at > now() - interval '10 minutes');
create policy fotos_remover_recentes on storage.objects for delete to anon, authenticated
  using (bucket_id = 'fotos' and created_at > now() - interval '10 minutes');
````

### `src/vite-env.d.ts`
````ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
````

### `src/main.tsx`
````tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
````

### `src/App.tsx`
````tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminPage from '@/pages/AdminPage';
import ApresentacaoPage from '@/pages/ApresentacaoPage';
import EnvioPage from '@/pages/EnvioPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnvioPage />} />
        <Route path="/apresentacao" element={<ApresentacaoPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
````

### `src/config/constants.ts`
````ts
export const INTERVALO_CAROUSEL_MS = 8000;
export const BUCKET_FOTOS = 'fotos';
export const CHAVE_SESSAO_LOCAL = 'calendario_sentimentos_session';
export const MAX_PALAVRAS = 3;
export const TIPOS_FOTO_PERMITIDOS: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];
export const TAMANHO_MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB
````

### `src/config/env.ts`
````ts
type NomeVariavel = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY';

function obrigatoria(nome: NomeVariavel): string {
  const valor = import.meta.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

export const env = {
  supabaseUrl: obrigatoria('VITE_SUPABASE_URL'),
  supabaseAnonKey: obrigatoria('VITE_SUPABASE_ANON_KEY'),
} as const;
````

### `src/config/supabase.ts`
````ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
````

### `src/types/auth.ts`
````ts
export interface UsuarioAdmin {
  id: string;
  email: string | null;
}
````

### `src/types/sentimento.ts`
````ts
export interface Envio {
  id: string;
  nome: string;
  semana: string; // YYYY-MM-DD (segunda-feira)
  palavras_segunda: string;
  foto_segunda_url: string | null;
  palavras_sexta: string;
  foto_sexta_url: string | null;
  criado_em: string;
}

export interface DadosEnvio {
  nome: string;
  palavrasSegunda: string;
  fotoSegundaUrl: string | null;
  palavrasSexta: string;
  fotoSextaUrl: string | null;
}

// Estado de um momento (segunda ou sexta) em formulários
export interface MomentoForm {
  palavras: string;
  arquivo: File | null;
  fotoAtual: string | null;
}

// Estado de edição do admin
export interface RascunhoAdmin {
  nome: string;
  segunda: MomentoForm;
  sexta: MomentoForm;
}

export type CampoLog =
  | 'nome'
  | 'palavras_segunda'
  | 'palavras_sexta'
  | 'foto_segunda'
  | 'foto_sexta';

export interface LogEdicao {
  id: string;
  sentimento_id: string;
  campo: CampoLog;
  valor_anterior: string | null;
  valor_novo: string | null;
  editado_por: 'usuario' | 'admin';
  editado_em: string;
}
````

### `src/utils/arquivo.ts`
````ts
import { TAMANHO_MAX_FOTO_BYTES, TIPOS_FOTO_PERMITIDOS } from '@/config/constants';

/** Retorna a mensagem de erro, ou null se a foto é válida. */
export function validarFoto(arquivo: File): string | null {
  if (!TIPOS_FOTO_PERMITIDOS.includes(arquivo.type)) {
    return 'Formato inválido. Use PNG, JPG ou WEBP.';
  }
  if (arquivo.size > TAMANHO_MAX_FOTO_BYTES) {
    return `Foto muito grande. Máximo de ${TAMANHO_MAX_FOTO_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}
````

### `src/utils/erro.ts`
````ts
export function mensagemDeErro(erro: unknown, padrao = 'Ocorreu um erro.'): string {
  if (typeof erro === 'object' && erro !== null && 'message' in erro) {
    return String((erro as { message: unknown }).message);
  }
  return padrao;
}
````

### `src/utils/palavras.ts`
````ts
import { MAX_PALAVRAS } from '@/config/constants';

export function contarPalavras(texto: string): number {
  return texto.split(/[,\s]+/).filter(Boolean).length;
}

export function validarPalavras(texto: string): boolean {
  const n = contarPalavras(texto);
  return n >= 1 && n <= MAX_PALAVRAS;
}
````

### `src/utils/semana.ts`
````ts
// Segunda-feira da semana de `base` (YYYY-MM-DD)
export function segundaDaSemana(base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatarSemana(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

export function mesmoDia(iso: string, base: Date = new Date()): boolean {
  return new Date(iso).toDateString() === base.toDateString();
}
````

### `src/utils/tom.ts`
````ts
export const TOTAL_TONS = 6;

/** Cor (0 a 5) fixa para cada pessoa, calculada pelo nome. */
export function tomDaPessoa(nome: string): number {
  let hash = 0;
  for (const c of nome.trim().toLowerCase()) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return hash % TOTAL_TONS;
}
````

### `src/utils/uploadTransacional.ts`
````ts
import type { IStorageService } from '@/services/interfaces/IStorageService';

/**
 * Sobe as fotos e executa `operacao` com as URLs (null onde não há arquivo novo).
 * Se qualquer etapa falhar, remove do storage as fotos que acabaram de ser enviadas.
 */
export async function comUploads<T>(
  storage: IStorageService,
  arquivos: (File | null)[],
  operacao: (urls: (string | null)[]) => Promise<T>
): Promise<T> {
  const enviadas: string[] = [];
  try {
    const urls: (string | null)[] = [];
    for (const arquivo of arquivos) {
      if (!arquivo) {
        urls.push(null);
        continue;
      }
      const url = await storage.uploadFoto(arquivo);
      enviadas.push(url);
      urls.push(url);
    }
    return await operacao(urls);
  } catch (erro) {
    if (enviadas.length > 0) await storage.removerPorUrl(enviadas).catch(() => undefined);
    throw erro;
  }
}
````

### `src/services/interfaces/IAdminSentimentoService.ts`
````ts
import type { DadosEnvio } from '@/types/sentimento';

export interface IAdminSentimentoService {
  atualizar(id: string, dados: DadosEnvio): Promise<void>;
  excluir(id: string): Promise<void>;
}
````

### `src/services/interfaces/IAuthService.ts`
````ts
import type { UsuarioAdmin } from '@/types/auth';

export interface IAuthService {
  obterUsuario(): Promise<UsuarioAdmin | null>;
  /** Observa mudanças de login. Retorna a função para cancelar a observação. */
  aoMudar(callback: (usuario: UsuarioAdmin | null) => void): () => void;
  entrar(email: string, senha: string): Promise<void>;
  sair(): Promise<void>;
}
````

### `src/services/interfaces/ILogService.ts`
````ts
import type { LogEdicao } from '@/types/sentimento';

export interface ILogService {
  listarPorEnvios(ids: string[]): Promise<LogEdicao[]>;
}
````

### `src/services/interfaces/ISentimentoService.ts`
````ts
import type { DadosEnvio, Envio } from '@/types/sentimento';

export interface ISentimentoService {
  listarPorSemana(semana: string): Promise<Envio[]>;
  /** Semanas que possuem envios, da mais recente para a mais antiga. */
  listarSemanas(): Promise<string[]>;
  /** Envio feito pela sessão atual na semana informada. */
  buscarDaSessao(semana: string): Promise<Envio | null>;
  enviar(semana: string, dados: DadosEnvio): Promise<void>;
  /** Edição pelo dono da sessão (permitida apenas no dia do envio). */
  editar(id: string, dados: DadosEnvio): Promise<void>;
}
````

### `src/services/interfaces/ISessaoService.ts`
````ts
export interface ISessaoService {
  /** Identificador anônimo da sessão do navegador (gerado e guardado no cache). */
  obterId(): string;
}
````

### `src/services/interfaces/IStorageService.ts`
````ts
export interface IStorageService {
  /** Valida (tipo e tamanho), envia a foto e devolve a URL pública. */
  uploadFoto(arquivo: File): Promise<string>;
  /** Remove fotos já enviadas a partir das URLs públicas. */
  removerPorUrl(urls: string[]): Promise<void>;
}
````

### `src/services/AdminSentimentoService.ts`
````ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosEnvio } from '@/types/sentimento';
import type { IAdminSentimentoService } from './interfaces/IAdminSentimentoService';

export class AdminSentimentoService implements IAdminSentimentoService {
  constructor(private readonly client: SupabaseClient) {}

  async atualizar(id: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client
      .from('sentimentos')
      .update({
        nome: d.nome,
        palavras_segunda: d.palavrasSegunda,
        foto_segunda_url: d.fotoSegundaUrl,
        palavras_sexta: d.palavrasSexta,
        foto_sexta_url: d.fotoSextaUrl,
      })
      .eq('id', id);
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.client.from('sentimentos').delete().eq('id', id);
    if (error) throw error;
  }
}
````

### `src/services/AuthService.ts`
````ts
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UsuarioAdmin } from '@/types/auth';
import type { IAuthService } from './interfaces/IAuthService';

function paraUsuario(user: User | null | undefined): UsuarioAdmin | null {
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export class AuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async obterUsuario(): Promise<UsuarioAdmin | null> {
    const { data } = await this.client.auth.getSession();
    return paraUsuario(data.session?.user);
  }

  aoMudar(callback: (usuario: UsuarioAdmin | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_evento, sessao) => {
      callback(paraUsuario(sessao?.user));
    });
    return () => data.subscription.unsubscribe();
  }

  async entrar(email: string, senha: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async sair(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
}
````

### `src/services/LogService.ts`
````ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LogEdicao } from '@/types/sentimento';
import type { ILogService } from './interfaces/ILogService';

export class LogService implements ILogService {
  constructor(private readonly client: SupabaseClient) {}

  async listarPorEnvios(ids: string[]): Promise<LogEdicao[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.client
      .from('sentimentos_log')
      .select('*')
      .in('sentimento_id', ids)
      .order('editado_em', { ascending: false });
    if (error) throw error;
    return (data ?? []) as LogEdicao[];
  }
}
````

### `src/services/SentimentoService.ts`
````ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosEnvio, Envio } from '@/types/sentimento';
import type { ISentimentoService } from './interfaces/ISentimentoService';
import type { ISessaoService } from './interfaces/ISessaoService';

export class SentimentoService implements ISentimentoService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly sessao: ISessaoService
  ) {}

  async listarPorSemana(semana: string): Promise<Envio[]> {
    const { data, error } = await this.client
      .from('sentimentos_publico')
      .select('*')
      .eq('semana', semana)
      .order('criado_em', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Envio[];
  }

  async listarSemanas(): Promise<string[]> {
    const { data, error } = await this.client.from('sentimentos_publico').select('semana');
    if (error) throw error;
    const unicas = new Set((data ?? []).map((r) => r.semana as string));
    return [...unicas].sort().reverse();
  }

  async buscarDaSessao(semana: string): Promise<Envio | null> {
    const { data, error } = await this.client.rpc('meu_envio', {
      p_session: this.sessao.obterId(),
      p_semana: semana,
    });
    if (error) throw error;
    return ((data as Envio[] | null) ?? [])[0] ?? null;
  }

  async enviar(semana: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client.rpc('enviar_sentimento', {
      p_session: this.sessao.obterId(),
      p_nome: d.nome,
      p_semana: semana,
      p_pal_seg: d.palavrasSegunda,
      p_foto_seg: d.fotoSegundaUrl,
      p_pal_sex: d.palavrasSexta,
      p_foto_sex: d.fotoSextaUrl,
    });
    if (error) throw error;
  }

  async editar(id: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client.rpc('editar_sentimento', {
      p_session: this.sessao.obterId(),
      p_id: id,
      p_nome: d.nome,
      p_pal_seg: d.palavrasSegunda,
      p_foto_seg: d.fotoSegundaUrl,
      p_pal_sex: d.palavrasSexta,
      p_foto_sex: d.fotoSextaUrl,
    });
    if (error) throw error;
  }
}
````

### `src/services/SessaoLocalService.ts`
````ts
import { CHAVE_SESSAO_LOCAL } from '@/config/constants';
import type { ISessaoService } from './interfaces/ISessaoService';

export class SessaoLocalService implements ISessaoService {
  obterId(): string {
    let id = localStorage.getItem(CHAVE_SESSAO_LOCAL);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CHAVE_SESSAO_LOCAL, id);
    }
    return id;
  }
}
````

### `src/services/StorageService.ts`
````ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { BUCKET_FOTOS } from '@/config/constants';
import { validarFoto } from '@/utils/arquivo';
import type { IStorageService } from './interfaces/IStorageService';

const EXTENSOES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export class StorageService implements IStorageService {
  constructor(private readonly client: SupabaseClient) {}

  async uploadFoto(arquivo: File): Promise<string> {
    const erroValidacao = validarFoto(arquivo);
    if (erroValidacao) throw new Error(erroValidacao);

    const caminho = `${crypto.randomUUID()}.${EXTENSOES[arquivo.type]}`;
    const { error } = await this.client.storage
      .from(BUCKET_FOTOS)
      .upload(caminho, arquivo, { contentType: arquivo.type });
    if (error) throw error;
    return this.client.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
  }

  async removerPorUrl(urls: string[]): Promise<void> {
    const marcador = `/object/public/${BUCKET_FOTOS}/`;
    const caminhos = urls
      .map((u) => u.indexOf(marcador))
      .map((i, n) => (i >= 0 ? decodeURIComponent(urls[n].slice(i + marcador.length)) : null))
      .filter((c): c is string => c !== null);
    if (caminhos.length === 0) return;
    const { error } = await this.client.storage.from(BUCKET_FOTOS).remove(caminhos);
    if (error) throw error;
  }
}
````

### `src/services/index.ts`
````ts
// Composição das dependências: o resto do app usa apenas as interfaces.
import { supabase } from '@/config/supabase';
import { AdminSentimentoService } from './AdminSentimentoService';
import { AuthService } from './AuthService';
import type { IAdminSentimentoService } from './interfaces/IAdminSentimentoService';
import type { IAuthService } from './interfaces/IAuthService';
import type { ILogService } from './interfaces/ILogService';
import type { ISentimentoService } from './interfaces/ISentimentoService';
import type { ISessaoService } from './interfaces/ISessaoService';
import type { IStorageService } from './interfaces/IStorageService';
import { LogService } from './LogService';
import { SentimentoService } from './SentimentoService';
import { SessaoLocalService } from './SessaoLocalService';
import { StorageService } from './StorageService';

export const sessaoService: ISessaoService = new SessaoLocalService();
export const storageService: IStorageService = new StorageService(supabase);
export const sentimentoService: ISentimentoService = new SentimentoService(supabase, sessaoService);
export const adminSentimentoService: IAdminSentimentoService = new AdminSentimentoService(supabase);
export const logService: ILogService = new LogService(supabase);
export const authService: IAuthService = new AuthService(supabase);
````

### `src/hooks/useAdminPainel.ts`
````ts
import { useCallback, useEffect, useState } from 'react';
import { adminSentimentoService, logService, storageService } from '@/services';
import type { Envio, LogEdicao, RascunhoAdmin } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';
import { validarPalavras } from '@/utils/palavras';
import { segundaDaSemana } from '@/utils/semana';
import { comUploads } from '@/utils/uploadTransacional';
import { useEnviosDaSemana } from './useEnviosDaSemana';
import { useSemanas } from './useSemanas';

export function useAdminPainel() {
  const [semana, setSemana] = useState(() => segundaDaSemana());
  const [logs, setLogs] = useState<LogEdicao[]>([]);
  const [mensagem, setMensagem] = useState('');
  const { semanas, recarregar: recarregarSemanas } = useSemanas();
  const { envios, recarregar: recarregarEnvios } = useEnviosDaSemana(semana);

  // Recarrega o log sempre que a lista de envios mudar (inclusive após edições)
  useEffect(() => {
    logService
      .listarPorEnvios(envios.map((e) => e.id))
      .then(setLogs)
      .catch((e) => setMensagem(mensagemDeErro(e)));
  }, [envios]);

  const salvarEdicao = useCallback(
    async (id: string, r: RascunhoAdmin): Promise<boolean> => {
      setMensagem('');
      if (!r.nome.trim()) {
        setMensagem('Informe o nome.');
        return false;
      }
      if (!validarPalavras(r.segunda.palavras) || !validarPalavras(r.sexta.palavras)) {
        setMensagem('Cada momento precisa de 1 a 3 palavras.');
        return false;
      }
      try {
        await comUploads(storageService, [r.segunda.arquivo, r.sexta.arquivo], async ([urlSegunda, urlSexta]) => {
          await adminSentimentoService.atualizar(id, {
            nome: r.nome.trim(),
            palavrasSegunda: r.segunda.palavras.trim(),
            fotoSegundaUrl: urlSegunda ?? r.segunda.fotoAtual,
            palavrasSexta: r.sexta.palavras.trim(),
            fotoSextaUrl: urlSexta ?? r.sexta.fotoAtual,
          });
        });
        await recarregarEnvios();
        return true;
      } catch (e) {
        setMensagem(mensagemDeErro(e, 'Erro ao salvar.'));
        return false;
      }
    },
    [recarregarEnvios]
  );

  const excluir = useCallback(
    async (envio: Envio) => {
      try {
        await adminSentimentoService.excluir(envio.id);
        await Promise.all([recarregarEnvios(), recarregarSemanas()]);
      } catch (e) {
        setMensagem(mensagemDeErro(e));
      }
    },
    [recarregarEnvios, recarregarSemanas]
  );

  return { semana, setSemana, semanas, envios, logs, mensagem, salvarEdicao, excluir };
}
````

### `src/hooks/useAuth.ts`
````ts
import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/services';
import type { UsuarioAdmin } from '@/types/auth';

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    void authService.obterUsuario().then((u) => {
      setUsuario(u);
      setCarregando(false);
    });
    return authService.aoMudar(setUsuario);
  }, []);

  const entrar = useCallback((email: string, senha: string) => authService.entrar(email, senha), []);
  const sair = useCallback(() => authService.sair(), []);

  return { usuario, carregando, entrar, sair };
}
````

### `src/hooks/useCarousel.ts`
````ts
import { useCallback, useEffect, useState } from 'react';

export function useCarousel(total: number, intervaloMs: number) {
  const [indice, setIndice] = useState(0);
  const [auto, setAuto] = useState(true);

  const proximo = useCallback(() => setIndice((i) => (total ? (i + 1) % total : 0)), [total]);
  const anterior = useCallback(
    () => setIndice((i) => (total ? (i - 1 + total) % total : 0)),
    [total]
  );
  const alternarAuto = useCallback(() => setAuto((a) => !a), []);
  const reiniciar = useCallback(() => setIndice(0), []);

  useEffect(() => {
    if (!auto || total < 2) return;
    const timer = setInterval(proximo, intervaloMs);
    return () => clearInterval(timer);
  }, [auto, total, intervaloMs, proximo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') proximo();
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === ' ') {
        e.preventDefault();
        alternarAuto();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [proximo, anterior, alternarAuto]);

  return { indice, auto, proximo, anterior, alternarAuto, reiniciar };
}
````

### `src/hooks/useEnviosDaSemana.ts`
````ts
import { useCallback, useEffect, useState } from 'react';
import { sentimentoService } from '@/services';
import type { Envio } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';

export function useEnviosDaSemana(semana: string) {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    try {
      setEnvios(await sentimentoService.listarPorSemana(semana));
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [semana]);

  useEffect(() => {
    setCarregando(true);
    void recarregar();
  }, [recarregar]);

  return { envios, carregando, erro, recarregar };
}
````

### `src/hooks/useFormularioEnvio.ts`
````ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { sentimentoService, storageService } from '@/services';
import type { Envio, MomentoForm } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';
import { validarPalavras } from '@/utils/palavras';
import { comUploads } from '@/utils/uploadTransacional';
import { mesmoDia, segundaDaSemana } from '@/utils/semana';

const momentoVazio: MomentoForm = { palavras: '', arquivo: null, fotoAtual: null };

export function useFormularioEnvio() {
  const semana = useMemo(() => segundaDaSemana(), []);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [nome, setNome] = useState('');
  const [segunda, setSegunda] = useState<MomentoForm>(momentoVazio);
  const [sexta, setSexta] = useState<MomentoForm>(momentoVazio);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const preencher = useCallback((e: Envio) => {
    setEnvio(e);
    setNome(e.nome);
    setSegunda({ palavras: e.palavras_segunda, arquivo: null, fotoAtual: e.foto_segunda_url });
    setSexta({ palavras: e.palavras_sexta, arquivo: null, fotoAtual: e.foto_sexta_url });
  }, []);

  useEffect(() => {
    sentimentoService
      .buscarDaSessao(semana)
      .then((e) => {
        if (e) preencher(e);
      })
      .catch((err) => setMensagem(mensagemDeErro(err)));
  }, [semana, preencher]);

  // Depois do dia do envio, só o admin edita
  const bloqueado = envio !== null && !mesmoDia(envio.criado_em);

  const submeter = useCallback(async () => {
    setMensagem('');
    if (!nome.trim()) return setMensagem('Informe seu nome.');
    if (!validarPalavras(segunda.palavras)) return setMensagem('Segunda: escreva de 1 a 3 palavras.');
    if (!validarPalavras(sexta.palavras)) return setMensagem('Sexta: escreva de 1 a 3 palavras.');

    setSalvando(true);
    try {
      await comUploads(storageService, [segunda.arquivo, sexta.arquivo], async ([urlSegunda, urlSexta]) => {
        const dados = {
          nome: nome.trim(),
          palavrasSegunda: segunda.palavras.trim(),
          fotoSegundaUrl: urlSegunda ?? segunda.fotoAtual,
          palavrasSexta: sexta.palavras.trim(),
          fotoSextaUrl: urlSexta ?? sexta.fotoAtual,
        };
        if (envio) await sentimentoService.editar(envio.id, dados);
        else await sentimentoService.enviar(semana, dados);
      });

      const atualizado = await sentimentoService.buscarDaSessao(semana);
      if (atualizado) preencher(atualizado);
      setMensagem(envio ? 'Atualizado!' : 'Enviado!');
    } catch (e) {
      setMensagem(mensagemDeErro(e, 'Erro ao salvar.'));
    } finally {
      setSalvando(false);
    }
  }, [nome, segunda, sexta, envio, semana, preencher]);

  return {
    envio,
    nome,
    setNome,
    segunda,
    setSegunda,
    sexta,
    setSexta,
    bloqueado,
    salvando,
    mensagem,
    submeter,
  };
}
````

### `src/hooks/useSemanas.ts`
````ts
import { useCallback, useEffect, useState } from 'react';
import { sentimentoService } from '@/services';
import { segundaDaSemana } from '@/utils/semana';

export function useSemanas() {
  const [semanas, setSemanas] = useState<string[]>(() => [segundaDaSemana()]);

  const recarregar = useCallback(async () => {
    try {
      const lista = await sentimentoService.listarSemanas();
      setSemanas([...new Set([segundaDaSemana(), ...lista])].sort().reverse());
    } catch {
      // mantém apenas a semana atual
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { semanas, recarregar };
}
````

### `src/components/common/Marca.tsx`
````tsx
import { TOTAL_TONS } from '@/utils/tom';

export default function Marca() {
  return (
    <span className="marca" aria-hidden="true">
      {Array.from({ length: TOTAL_TONS }, (_, i) => (
        <span key={i} className={`tom-${i}`} />
      ))}
    </span>
  );
}
````

### `src/components/common/SemanaSelect.tsx`
````tsx
import { formatarSemana } from '@/utils/semana';

interface Props {
  semanas: string[];
  valor: string;
  onChange: (semana: string) => void;
}

export default function SemanaSelect({ semanas, valor, onChange }: Props) {
  return (
    <select className="seletor" aria-label="Semana" value={valor} onChange={(e) => onChange(e.target.value)}>
      {semanas.map((s) => (
        <option key={s} value={s}>
          Semana de {formatarSemana(s)}
        </option>
      ))}
    </select>
  );
}
````

### `src/components/form/MomentoFieldset.tsx`
````tsx
import { useState } from 'react';
import { TAMANHO_MAX_FOTO_BYTES, TIPOS_FOTO_PERMITIDOS } from '@/config/constants';
import type { MomentoForm } from '@/types/sentimento';
import { validarFoto } from '@/utils/arquivo';

interface Props {
  legenda: string;
  valor: MomentoForm;
  onChange: (momento: MomentoForm) => void;
  desabilitado?: boolean;
  /** Mostra o botão para remover a foto atual (uso no admin). */
  permitirRemoverFoto?: boolean;
}

export default function MomentoFieldset({
  legenda,
  valor,
  onChange,
  desabilitado,
  permitirRemoverFoto,
}: Props) {
  const [erroFoto, setErroFoto] = useState('');
  const temFotoAtual = valor.fotoAtual !== null && valor.arquivo === null;

  return (
    <fieldset className="momento" disabled={desabilitado}>
      <legend>{legenda}</legend>
      <input
        className="campo"
        placeholder="até 3 palavras, separadas por vírgula"
        aria-label={`Palavras: ${legenda}`}
        value={valor.palavras}
        onChange={(e) => onChange({ ...valor, palavras: e.target.value })}
      />
      <input
        className="arquivo"
        type="file"
        aria-label={`Foto: ${legenda}`}
        accept={TIPOS_FOTO_PERMITIDOS.join(',')}
        onChange={(e) => {
          const arquivo = e.target.files?.[0] ?? null;
          const erro = arquivo ? validarFoto(arquivo) : null;
          setErroFoto(erro ?? '');
          if (erro) e.target.value = '';
          onChange({ ...valor, arquivo: erro ? null : arquivo });
        }}
      />
      <small className="dica">
        PNG, JPG ou WEBP, até {TAMANHO_MAX_FOTO_BYTES / 1024 / 1024} MB
      </small>
      {erroFoto && (
        <small className="erro-campo" role="alert">
          {erroFoto}
        </small>
      )}
      {temFotoAtual && <img className="miniatura" src={valor.fotoAtual ?? ''} alt="" />}
      {permitirRemoverFoto && temFotoAtual && (
        <button type="button" className="botao-sec botao-peq" onClick={() => onChange({ ...valor, fotoAtual: null })}>
          Remover foto
        </button>
      )}
    </fieldset>
  );
}
````

### `src/components/carousel/SlideSentimento.tsx`
````tsx
import type { Envio } from '@/types/sentimento';
import { tomDaPessoa } from '@/utils/tom';

interface BlocoProps {
  titulo: string;
  dica: string;
  palavras: string;
  foto: string | null;
  inicial: string;
}

function Bloco({ titulo, dica, palavras, foto, inicial }: BlocoProps) {
  return (
    <div className="bloco">
      <div className="bloco-titulo">
        <h3>{titulo}</h3>
        <span>{dica}</span>
      </div>
      {foto ? (
        <img src={foto} alt={palavras} />
      ) : (
        <div className="sem-foto" aria-hidden="true">
          {inicial}
        </div>
      )}
      <p className="palavras">{palavras}</p>
    </div>
  );
}

interface Props {
  envio: Envio;
  posicao: number;
  total: number;
}

export default function SlideSentimento({ envio, posicao, total }: Props) {
  const inicial = envio.nome.trim().charAt(0).toUpperCase();

  return (
    <section className={`slide tom-${tomDaPessoa(envio.nome)}`}>
      <div className="slide-topo">
        <h2>{envio.nome}</h2>
        <span className="contador">
          {posicao} de {total}
        </span>
      </div>
      <div className="blocos">
        <Bloco
          titulo="Segunda"
          dica="Como estou"
          palavras={envio.palavras_segunda}
          foto={envio.foto_segunda_url}
          inicial={inicial}
        />
        <Bloco
          titulo="Sexta"
          dica="Como espero estar"
          palavras={envio.palavras_sexta}
          foto={envio.foto_sexta_url}
          inicial={inicial}
        />
      </div>
    </section>
  );
}
````

### `src/components/admin/EnviosTable.tsx`
````tsx
import type { Envio, RascunhoAdmin } from '@/types/sentimento';
import LinhaEnvio from './LinhaEnvio';

interface Props {
  envios: Envio[];
  onSalvar: (id: string, rascunho: RascunhoAdmin) => Promise<boolean>;
  onExcluir: (envio: Envio) => void;
}

export default function EnviosTable({ envios, onSalvar, onExcluir }: Props) {
  if (envios.length === 0) return <p className="vazio-admin">Nenhum envio nesta semana.</p>;

  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Segunda</th>
            <th>Sexta</th>
            <th>Enviado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((e) => (
            <LinhaEnvio key={e.id} envio={e} onSalvar={onSalvar} onExcluir={onExcluir} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
````

### `src/components/admin/LinhaEnvio.tsx`
````tsx
import { useState } from 'react';
import MomentoFieldset from '@/components/form/MomentoFieldset';
import type { Envio, RascunhoAdmin } from '@/types/sentimento';
import { formatarDataHora } from '@/utils/semana';

interface Props {
  envio: Envio;
  onSalvar: (id: string, rascunho: RascunhoAdmin) => Promise<boolean>;
  onExcluir: (envio: Envio) => void;
}

function criarRascunho(e: Envio): RascunhoAdmin {
  return {
    nome: e.nome,
    segunda: { palavras: e.palavras_segunda, arquivo: null, fotoAtual: e.foto_segunda_url },
    sexta: { palavras: e.palavras_sexta, arquivo: null, fotoAtual: e.foto_sexta_url },
  };
}

function CelulaMomento({ palavras, foto }: { palavras: string; foto: string | null }) {
  return (
    <div className="celula-foto">
      {foto && <img className="miniatura" src={foto} alt="" />}
      <span>{palavras}</span>
    </div>
  );
}

export default function LinhaEnvio({ envio, onSalvar, onExcluir }: Props) {
  const [rascunho, setRascunho] = useState<RascunhoAdmin | null>(null);

  async function salvar() {
    if (rascunho && (await onSalvar(envio.id, rascunho))) setRascunho(null);
  }

  if (rascunho) {
    return (
      <tr>
        <td>
          <input
            className="campo"
            aria-label="Nome"
            value={rascunho.nome}
            onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
          />
        </td>
        <td>
          <MomentoFieldset
            legenda="Segunda"
            valor={rascunho.segunda}
            onChange={(m) => setRascunho({ ...rascunho, segunda: m })}
            permitirRemoverFoto
          />
        </td>
        <td>
          <MomentoFieldset
            legenda="Sexta"
            valor={rascunho.sexta}
            onChange={(m) => setRascunho({ ...rascunho, sexta: m })}
            permitirRemoverFoto
          />
        </td>
        <td>{formatarDataHora(envio.criado_em)}</td>
        <td>
          <div className="celula-acoes">
            <button className="botao botao-peq" onClick={salvar}>
              Salvar
            </button>
            <button className="botao-sec botao-peq" onClick={() => setRascunho(null)}>
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{envio.nome}</td>
      <td>
        <CelulaMomento palavras={envio.palavras_segunda} foto={envio.foto_segunda_url} />
      </td>
      <td>
        <CelulaMomento palavras={envio.palavras_sexta} foto={envio.foto_sexta_url} />
      </td>
      <td>{formatarDataHora(envio.criado_em)}</td>
      <td>
        <div className="celula-acoes">
          <button className="botao-sec botao-peq" onClick={() => setRascunho(criarRascunho(envio))}>
            Editar
          </button>
          <button className="botao-perigo botao-peq" onClick={() => onExcluir(envio)}>
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}
````

### `src/components/admin/LogList.tsx`
````tsx
import type { LogEdicao } from '@/types/sentimento';
import { formatarDataHora } from '@/utils/semana';

const ROTULOS: Record<LogEdicao['campo'], string> = {
  nome: 'Nome',
  palavras_segunda: 'Palavras (segunda)',
  palavras_sexta: 'Palavras (sexta)',
  foto_segunda: 'Foto (segunda)',
  foto_sexta: 'Foto (sexta)',
};

function descrever(l: LogEdicao): string {
  if (l.campo.startsWith('foto')) return 'foto alterada';
  return `de "${l.valor_anterior ?? ''}" para "${l.valor_novo ?? ''}"`;
}

interface Props {
  logs: LogEdicao[];
  nomePorId: (id: string) => string;
}

export default function LogList({ logs, nomePorId }: Props) {
  if (logs.length === 0) return <p className="vazio-admin">Nenhuma edição registrada.</p>;

  return (
    <ul className="log">
      {logs.map((l) => (
        <li key={l.id}>
          {formatarDataHora(l.editado_em)} · {nomePorId(l.sentimento_id)} · {ROTULOS[l.campo]}:{' '}
          {descrever(l)} · por {l.editado_por}
        </li>
      ))}
    </ul>
  );
}
````

### `src/components/admin/LoginForm.tsx`
````tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import Marca from '@/components/common/Marca';

interface Props {
  onEntrar: (email: string, senha: string) => Promise<void>;
}

export default function LoginForm({ onEntrar }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function submeter(ev: FormEvent) {
    ev.preventDefault();
    setErro('');
    try {
      await onEntrar(email, senha);
    } catch {
      setErro('E-mail ou senha incorretos.');
    }
  }

  return (
    <form onSubmit={submeter} className="pagina pagina-login">
      <header className="topo">
        <Marca />
        <h1>Admin</h1>
        <p>Entre para editar envios e ver o histórico de edições.</p>
      </header>
      <label className="rotulo">
        E-mail
        <input
          className="campo"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="rotulo">
        Senha
        <input
          className="campo"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </label>
      <button className="botao" type="submit">
        Entrar
      </button>
      {erro && (
        <p className="mensagem" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
````

### `src/components/admin/PainelAdmin.tsx`
````tsx
import SemanaSelect from '@/components/common/SemanaSelect';
import { useAdminPainel } from '@/hooks/useAdminPainel';
import EnviosTable from './EnviosTable';
import LogList from './LogList';

interface Props {
  onSair: () => void;
}

export default function PainelAdmin({ onSair }: Props) {
  const { semana, setSemana, semanas, envios, logs, mensagem, salvarEdicao, excluir } = useAdminPainel();
  const nomePorId = (id: string) => envios.find((e) => e.id === id)?.nome ?? id;

  return (
    <div className="pagina pagina-admin">
      <header className="barra">
        <h1>Admin</h1>
        <SemanaSelect semanas={semanas} valor={semana} onChange={setSemana} />
        <button className="botao-sec" onClick={onSair}>
          Sair
        </button>
      </header>
      {mensagem && (
        <p className="mensagem" role="status">
          {mensagem}
        </p>
      )}

      <h2>Envios</h2>
      <EnviosTable
        envios={envios}
        onSalvar={salvarEdicao}
        onExcluir={(e) => {
          if (window.confirm(`Excluir o envio de ${e.nome}?`)) void excluir(e);
        }}
      />

      <h2>Histórico de edições</h2>
      <LogList logs={logs} nomePorId={nomePorId} />
    </div>
  );
}
````

### `src/pages/AdminPage.tsx`
````tsx
import LoginForm from '@/components/admin/LoginForm';
import PainelAdmin from '@/components/admin/PainelAdmin';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { usuario, carregando, entrar, sair } = useAuth();

  if (carregando) return <p className="pagina">Carregando...</p>;
  if (!usuario) return <LoginForm onEntrar={entrar} />;
  return <PainelAdmin onSair={() => void sair()} />;
}
````

### `src/pages/ApresentacaoPage.tsx`
````tsx
import { useEffect, useState } from 'react';
import SlideSentimento from '@/components/carousel/SlideSentimento';
import Marca from '@/components/common/Marca';
import SemanaSelect from '@/components/common/SemanaSelect';
import { INTERVALO_CAROUSEL_MS } from '@/config/constants';
import { useCarousel } from '@/hooks/useCarousel';
import { useEnviosDaSemana } from '@/hooks/useEnviosDaSemana';
import { useSemanas } from '@/hooks/useSemanas';
import { segundaDaSemana } from '@/utils/semana';
import '@/styles/apresentacao.css';

export default function ApresentacaoPage() {
  const [semana, setSemana] = useState(() => segundaDaSemana());
  const { semanas } = useSemanas();
  const { envios } = useEnviosDaSemana(semana);
  const { indice, auto, proximo, anterior, alternarAuto, reiniciar } = useCarousel(
    envios.length,
    INTERVALO_CAROUSEL_MS
  );

  useEffect(() => {
    reiniciar();
  }, [semana, reiniciar]);

  const atual = envios[indice];

  return (
    <div className="apresentacao">
      <header>
        <h1>
          <Marca />
          Weekln
        </h1>
        <SemanaSelect semanas={semanas} valor={semana} onChange={setSemana} />
        <button className="botao-sec" onClick={alternarAuto}>
          {auto ? 'Pausar' : 'Reproduzir'}
        </button>
      </header>

      {!atual ? (
        <p className="vazio">Ninguém enviou o sentimento desta semana ainda.</p>
      ) : (
        <main>
          <button className="seta" onClick={anterior} aria-label="Anterior">
            ‹
          </button>
          <SlideSentimento key={atual.id} envio={atual} posicao={indice + 1} total={envios.length} />
          <button className="seta" onClick={proximo} aria-label="Próximo">
            ›
          </button>
        </main>
      )}
    </div>
  );
}
````

### `src/pages/EnvioPage.tsx`
````tsx
import Marca from '@/components/common/Marca';
import MomentoFieldset from '@/components/form/MomentoFieldset';
import { useFormularioEnvio } from '@/hooks/useFormularioEnvio';

export default function EnvioPage() {
  const f = useFormularioEnvio();

  return (
    <div className="pagina">
      <header className="topo">
        <Marca />
        <h1>Como você está nesta semana?</h1>
        <p>Escreva de 1 a 3 palavras para segunda e para sexta. A foto é opcional.</p>
      </header>

      <label className="rotulo">
        Seu nome
        <input
          className="campo"
          value={f.nome}
          onChange={(e) => f.setNome(e.target.value)}
          disabled={f.bloqueado}
        />
      </label>

      <div className="momentos">
        <MomentoFieldset
          legenda="Segunda: como estou"
          valor={f.segunda}
          onChange={f.setSegunda}
          desabilitado={f.bloqueado}
        />
        <MomentoFieldset
          legenda="Sexta: como espero estar"
          valor={f.sexta}
          onChange={f.setSexta}
          desabilitado={f.bloqueado}
        />
      </div>

      {f.bloqueado && (
        <p className="mensagem">Você já enviou nesta semana. Depois do dia do envio, só o admin edita.</p>
      )}
      <div className="acoes">
        <button className="botao" onClick={() => void f.submeter()} disabled={f.salvando || f.bloqueado}>
          {f.envio ? 'Atualizar' : 'Enviar'}
        </button>
        {f.mensagem && (
          <p className="mensagem" role="status">
            {f.mensagem}
          </p>
        )}
      </div>
    </div>
  );
}
````

### `src/styles/apresentacao.css`
````css
.apresentacao {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(1rem, 2.5vw, 2rem);
  background: #0e1124;
  color: #f4f5fb;
}
.apresentacao header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.apresentacao header h1 {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.apresentacao .seletor,
.apresentacao .botao-sec {
  background: #1a1f3d;
  border-color: #2b3160;
  color: #f4f5fb;
}
.apresentacao .botao-sec:hover:not(:disabled) {
  border-color: #6670b8;
}
.apresentacao main {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 1rem;
}
.seta {
  flex: none;
  align-self: center;
  width: 52px;
  height: 52px;
  border: 1.5px solid #2b3160;
  border-radius: 50%;
  background: #1a1f3d;
  color: #f4f5fb;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
}
.seta:hover {
  background: #262c58;
}

/* slide: a cor da pessoa é o destaque da tela */
.slide {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 2rem);
  padding: clamp(1.25rem, 3vw, 3rem);
  border-radius: 36px;
  background: var(--tom);
  color: var(--tinta);
  animation: entrar 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.slide-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.slide-topo h2 {
  font-size: clamp(2.2rem, 6vw, 5rem);
  font-weight: 800;
  overflow-wrap: anywhere;
}
.contador {
  flex: none;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgb(21 26 51 / 0.12);
  font-weight: 700;
}
.blocos {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
}
.bloco {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-width: 0;
  animation: subir 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}
.bloco:nth-child(2) {
  animation-delay: 0.12s;
}
.bloco-titulo {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.bloco-titulo h3 {
  font-size: 1.5rem;
}
.bloco-titulo span {
  opacity: 0.7;
  font-weight: 500;
}
.bloco img,
.sem-foto {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 24px;
  background: rgb(255 255 255 / 0.45);
}
.sem-foto {
  display: grid;
  place-items: center;
  font-family: var(--fonte-titulo);
  font-weight: 800;
  font-size: clamp(3rem, 9vw, 7rem);
  color: rgb(21 26 51 / 0.3);
}
.palavras {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 800;
  font-size: clamp(1.8rem, 4.2vw, 3.8rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
}
.vazio {
  margin: auto;
  color: #9aa1c9;
  font-size: 1.2rem;
}

@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes subir {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 760px) {
  .blocos {
    grid-template-columns: 1fr;
  }
  .seta {
    width: 40px;
    height: 40px;
    font-size: 1.4rem;
  }
  .slide {
    border-radius: 28px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .slide,
  .bloco {
    animation: none;
  }
}
````

### `src/styles/global.css`
````css
/* ---------- tokens ---------- */
:root {
  --tinta: #151a33;
  --tinta-2: #4a5170;
  --papel: #f6f7fb;
  --superficie: #ffffff;
  --linha: #dfe3f0;
  --primaria: #2f4bff;
  --primaria-escura: #2339d6;
  --primaria-clara: #e8ecff;
  --erro: #d6334a;

  --raio-g: 28px;
  --raio-m: 18px;
  --raio-p: 12px;

  --fonte-titulo: 'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif;
  --fonte-texto: 'Figtree', 'Segoe UI', system-ui, sans-serif;
}

/* um tom para cada pessoa / sentimento */
.tom-0 { --tom: #ffc24b; }
.tom-1 { --tom: #ff7a70; }
.tom-2 { --tom: #4fe0a2; }
.tom-3 { --tom: #5cc8ff; }
.tom-4 { --tom: #a78bfa; }
.tom-5 { --tom: #ff92c8; }

/* ---------- base ---------- */
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  color-scheme: light;
}
body {
  margin: 0;
  background: var(--papel);
  color: var(--tinta);
  font-family: var(--fonte-texto);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
h1,
h2,
h3 {
  margin: 0;
  font-family: var(--fonte-titulo);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
button,
input,
select {
  font: inherit;
  color: inherit;
}
:focus-visible {
  outline: 3px solid var(--primaria);
  outline-offset: 3px;
}

/* ---------- layout ---------- */
.pagina {
  max-width: 760px;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.pagina h2 {
  font-size: 1.5rem;
}
.topo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.topo h1 {
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: 800;
}
.topo p {
  margin: 0;
  max-width: 46ch;
  color: var(--tinta-2);
  font-size: 1.1rem;
}
.marca {
  display: inline-flex;
  gap: 6px;
}
.marca span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--tom);
}

/* ---------- formulário ---------- */
.rotulo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 700;
}
.campo {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--linha);
  border-radius: var(--raio-p);
  background: var(--superficie);
  font-weight: 500;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.campo:hover {
  border-color: #c3c9e0;
}
.campo:focus-visible {
  outline: none;
  border-color: var(--primaria);
  box-shadow: 0 0 0 4px rgb(47 75 255 / 0.15);
}
.campo:disabled {
  background: #eceff7;
  color: var(--tinta-2);
}
.momentos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.momento {
  min-width: 0;
  margin: 0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1.5px solid var(--linha);
  border-radius: var(--raio-m);
  background: var(--superficie);
  transition: border-color 0.15s;
}
.momento:focus-within {
  border-color: var(--primaria);
}
.momento legend {
  padding: 0 0.4rem;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 1.15rem;
}
.arquivo {
  font-size: 0.9rem;
  color: var(--tinta-2);
  max-width: 100%;
}
.arquivo::file-selector-button {
  margin-right: 0.75rem;
  padding: 0.5rem 0.95rem;
  border: none;
  border-radius: 999px;
  background: var(--primaria-clara);
  color: var(--primaria-escura);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.arquivo::file-selector-button:hover {
  background: #d6dcff;
}
.dica {
  color: var(--tinta-2);
  font-size: 0.85rem;
}
.erro-campo {
  color: var(--erro);
  font-weight: 500;
}
.miniatura {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--raio-p);
}
.acoes {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.mensagem {
  margin: 0;
  padding: 0.7rem 1rem;
  border-radius: var(--raio-p);
  background: var(--primaria-clara);
  color: var(--primaria-escura);
  font-weight: 500;
}

/* ---------- botões ---------- */
.botao,
.botao-sec,
.botao-perigo {
  padding: 0.8rem 1.6rem;
  border: 1.5px solid transparent;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.botao {
  background: var(--primaria);
  color: #fff;
}
.botao:hover:not(:disabled) {
  background: var(--primaria-escura);
}
.botao-sec {
  background: var(--superficie);
  border-color: var(--linha);
}
.botao-sec:hover:not(:disabled) {
  border-color: var(--tinta-2);
}
.botao-perigo {
  background: var(--superficie);
  border-color: #f2c4cb;
  color: var(--erro);
}
.botao-perigo:hover:not(:disabled) {
  background: #fdecee;
}
.botao:active:not(:disabled),
.botao-sec:active:not(:disabled),
.botao-perigo:active:not(:disabled) {
  transform: scale(0.97);
}
.botao:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.botao-peq {
  padding: 0.45rem 1rem;
  font-size: 0.9rem;
}

/* ---------- login e admin ---------- */
.pagina-login {
  max-width: 440px;
  min-height: 100vh;
  justify-content: center;
}
.pagina-admin {
  max-width: 1180px;
}
.barra {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.barra h1 {
  flex: 1;
  font-size: 2.2rem;
  font-weight: 800;
}
.seletor {
  padding: 0.6rem 1rem;
  border: 1.5px solid var(--linha);
  border-radius: 999px;
  background: var(--superficie);
  font-weight: 500;
  cursor: pointer;
}
.tabela-wrap {
  overflow-x: auto;
  border: 1.5px solid var(--linha);
  border-radius: var(--raio-m);
  background: var(--superficie);
}
.tabela {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
.tabela th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--tinta-2);
  border-bottom: 1.5px solid var(--linha);
}
.tabela td {
  padding: 0.85rem 1rem;
  vertical-align: top;
  border-bottom: 1px solid var(--linha);
}
.tabela tr:last-child td {
  border-bottom: none;
}
.tabela .momento {
  min-width: 230px;
  padding: 0.9rem;
}
.tabela .miniatura {
  width: 56px;
  height: 56px;
}
.celula-foto,
.celula-acoes {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.vazio-admin {
  margin: 0;
  color: var(--tinta-2);
}
.log {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.log li {
  padding: 0.75rem 1rem;
  border: 1px solid var(--linha);
  border-radius: var(--raio-p);
  background: var(--superficie);
  font-size: 0.95rem;
}

@media (max-width: 720px) {
  .momentos {
    grid-template-columns: 1fr;
  }
}
````
