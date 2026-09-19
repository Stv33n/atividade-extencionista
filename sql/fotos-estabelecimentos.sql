-- Execute no SQL Editor do Supabase antes de publicar o envio de fotos.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-estabelecimentos', 'fotos-estabelecimentos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Cada fornecedor aprovado envia somente para sua própria pasta.
drop policy if exists "fornecedor_envia_foto_estabelecimento" on storage.objects;
create policy "fornecedor_envia_foto_estabelecimento"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'fotos-estabelecimentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1 from public.fornecedores as fornecedor
        where fornecedor.id = (select auth.uid()) and fornecedor.status = 'Aprovado'
    )
);

-- A leitura das imagens é pública pelo bucket; não libera consulta aos cadastros.
-- Cada envio usa um nome único, sem precisar sobrescrever arquivos existentes.
commit;
