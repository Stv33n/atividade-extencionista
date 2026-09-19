-- Execute no SQL Editor do projeto Supabase antes de publicar os novos arquivos.
-- Campos antigos e políticas de acesso existentes são preservados.
begin;
alter table public.produtos
    add column if not exists categoria text not null default 'Outros',
    add column if not exists conteudo numeric,
    add column if not exists unidade text,
    add column if not exists preco_anterior numeric;
alter table public.estabelecimentos add column if not exists logo_url text;
-- NOT VALID preserva cadastros antigos; novos cadastros e alterações são validados.
alter table public.produtos add constraint produtos_medida_valida check (
    (conteudo is null and unidade is null) or
    (conteudo is not null and unidade is not null and conteudo > 0 and unidade in ('un', 'kg', 'g', 'l', 'ml'))
) not valid;
alter table public.produtos add constraint produtos_categoria_valida check (
    categoria in ('Frutas', 'Legumes', 'Cereais', 'Limpeza', 'Carnes', 'Outros')
) not valid;
alter table public.produtos add constraint produtos_promocao_valida check (
    preco_anterior is null or (preco_anterior > 0 and (not coalesce(promocao, false) or preco_anterior > preco))
) not valid;
commit;
