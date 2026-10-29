-- Weekln: login para todos, admins por e-mail e palavras separadas só por vírgula.
-- Rode uma vez no SQL Editor do Supabase, depois do schema original.

-- 1. Admins: só os e-mails desta tabela acessam /admin e editam/excluem qualquer envio
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.e_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
revoke execute on function public.e_admin() from public, anon;
grant execute on function public.e_admin() to authenticated;

-- 2. Palavras: 1 a 3, separadas só por vírgula; cada palavra com no máximo um espaço
create or replace function public.max_3_palavras(t text)
returns boolean language sql immutable as $$
  select cardinality(itens) between 1 and 3
     and not exists (select 1 from unnest(itens) i where i ~ '\s.*\s')
  from (
    select array_remove(array(select trim(x) from unnest(string_to_array(t, ',')) x), '') as itens
  ) s
$$;

-- 3. Envios ligados ao usuário logado (session_id passa a guardar o id do usuário)
drop function if exists public.enviar_sentimento(uuid, text, date, text, text, text, text);
drop function if exists public.editar_sentimento(uuid, uuid, text, text, text, text, text);
drop function if exists public.meu_envio(uuid, date);

create or replace function public.enviar_sentimento(
  p_nome text, p_semana date,
  p_pal_seg text, p_foto_seg text, p_pal_sex text, p_foto_sex text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Faça login para enviar'; end if;
  insert into public.sentimentos
    (session_id, nome, semana, palavras_segunda, foto_segunda_url, palavras_sexta, foto_sexta_url)
  values (auth.uid(), p_nome, p_semana, p_pal_seg, p_foto_seg, p_pal_sex, p_foto_sex)
  returning id into v_id;
  return v_id;
end $$;

-- Editar: só o dono, só no mesmo dia do envio
create or replace function public.editar_sentimento(
  p_id uuid, p_nome text,
  p_pal_seg text, p_foto_seg text, p_pal_sex text, p_foto_sex text
) returns void language plpgsql security definer set search_path = public as $$
declare v public.sentimentos;
begin
  select * into v from public.sentimentos where id = p_id and session_id = auth.uid();
  if not found then raise exception 'Envio não encontrado para este usuário'; end if;
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

create or replace function public.meu_envio(p_semana date)
returns setof public.sentimentos language sql security definer set search_path = public as $$
  select * from public.sentimentos where session_id = auth.uid() and semana = p_semana
$$;

revoke execute on function public.enviar_sentimento(text, date, text, text, text, text),
  public.editar_sentimento(uuid, text, text, text, text, text),
  public.meu_envio(date) from public, anon;
grant execute on function public.enviar_sentimento(text, date, text, text, text, text),
  public.editar_sentimento(uuid, text, text, text, text, text),
  public.meu_envio(date) to authenticated;

-- 4. Leitura só para quem está logado; "meu" indica o envio do próprio usuário (sem expor ids)
create or replace view public.sentimentos_publico as
  select id, nome, semana, palavras_segunda, foto_segunda_url,
         palavras_sexta, foto_sexta_url, criado_em, atualizado_em,
         (session_id = auth.uid()) as meu
  from public.sentimentos;
revoke all on public.sentimentos_publico from anon;
grant select on public.sentimentos_publico to authenticated;

-- 5. Edição/exclusão direta e histórico: só admins (antes era qualquer usuário logado)
drop policy if exists admin_all on public.sentimentos;
drop policy if exists admin_log on public.sentimentos_log;
create policy admin_all on public.sentimentos for all to authenticated
  using (public.e_admin()) with check (public.e_admin());
create policy admin_log on public.sentimentos_log for select to authenticated
  using (public.e_admin());
grant select, update, delete on public.sentimentos to authenticated;
grant select on public.sentimentos_log to authenticated;

-- 6. Log: agora todos estão logados, então "admin" é quem está na tabela admins
create or replace function public.log_edicao()
returns trigger language plpgsql security definer set search_path = public as $$
declare quem text := case when public.e_admin() then 'admin' else 'usuario' end;
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

-- 7. Fotos: só usuários logados enviam; rollback só das próprias fotos recentes
drop policy if exists fotos_upload on storage.objects;
drop policy if exists fotos_select_recentes on storage.objects;
drop policy if exists fotos_remover_recentes on storage.objects;
create policy fotos_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos');
create policy fotos_select_recentes on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and owner_id = auth.uid()::text and created_at > now() - interval '10 minutes');
create policy fotos_remover_recentes on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and owner_id = auth.uid()::text and created_at > now() - interval '10 minutes');

-- 8. Cadastre o(s) admin(s) com o mesmo e-mail usado no login (troque abaixo e rode)
-- insert into public.admins (email) values ('seu-email@empresa.com.br');
