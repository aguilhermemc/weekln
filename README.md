# Weekln

Cada pessoa registra como está na segunda e como espera estar na sexta (até 3 palavras + foto opcional).
As respostas são exibidas em um carousel durante a semana.

**Stack:** React + TypeScript (Vite), Supabase (Postgres, Auth, Storage), Vercel.

## Rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Rode `supabase/schema.sql` e depois `supabase/migracao-login-palavras.sql` no SQL Editor do Supabase
4. Em Authentication > Users, crie uma conta para cada pessoa (Auto Confirm User) e desative signups
5. Cadastre os admins: `insert into public.admins (email) values ('email@empresa.com.br');`
6. `npm run dev`

## Rotas

Todas exigem login.

| Rota                    | Descrição                                              |
| ----------------------- | ------------------------------------------------------ |
| `/login`                | Entrada com e-mail e senha                             |
| `/`                     | Envio e edição (no dia) do sentimento                  |
| `/apresentacao/:semana` | Carousel da semana (← → e espaço); `/apresentacao` abre a atual |
| `/admin`                | Edição, exclusão e log de edições (só admins)          |

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

- Leitura só para usuários logados, pela view `sentimentos_publico` (sem o id do dono)
- Envio e edição via funções RPC; o dono é o usuário logado e só edita no dia do envio
- Admin = e-mail na tabela `admins`; trigger registra o log ("de X para Y"; foto: só "foto alterada")
- Palavras: 1 a 3, separadas por vírgula; cada palavra com no máximo um espaço
- Novos envios são verificados a cada 15 s (aviso no canto da tela)
