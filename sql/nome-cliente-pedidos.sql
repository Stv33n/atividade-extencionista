-- Execute no SQL Editor do Supabase antes de publicar esta atualização.
begin;

alter table public.pedidos add column if not exists nome_cliente text;

-- Guarda somente o nome necessário para identificar a retirada.
-- Pedidos existentes usam o nome atual do cadastro, quando disponível.
update public.pedidos as pedido
set nome_cliente = nullif(btrim(usuario.raw_user_meta_data ->> 'nome'), '')
from auth.users as usuario
where usuario.id = pedido.cliente_id
  and nullif(btrim(pedido.nome_cliente), '') is null;

create or replace function public.registrar_nome_cliente_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- Mantém o nome registrado na compra durante as atualizações do pedido.
    if TG_OP = 'UPDATE' then
        new.nome_cliente := old.nome_cliente;
        return new;
    end if;

    -- Usa o cadastro vinculado ao pedido, sem confiar em um nome enviado pelo navegador.
    select nullif(btrim(usuario.raw_user_meta_data ->> 'nome'), '')
      into new.nome_cliente
      from auth.users as usuario
     where usuario.id = new.cliente_id;

    return new;
end;
$$;

revoke all on function public.registrar_nome_cliente_pedido() from public, anon, authenticated;

drop trigger if exists registrar_nome_cliente_pedido on public.pedidos;
create trigger registrar_nome_cliente_pedido
before insert or update on public.pedidos
for each row execute function public.registrar_nome_cliente_pedido();

commit;
