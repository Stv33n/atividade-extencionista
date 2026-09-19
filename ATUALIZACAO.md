Para ativar a atualização
========================

1. No SQL Editor do projeto Supabase, execute `supabase/melhorias-catalogo.sql` uma vez, antes de publicar os arquivos do site. O script adiciona os campos e preserva os registros e as políticas existentes.
2. Publique os arquivos HTML, CSS e JavaScript atualizados juntos.
3. Na área do fornecedor, edite os produtos existentes para preencher a categoria, o conteúdo e a unidade corretos. Produtos sem essas informações aparecem em Outros, com “Conteúdo não informado”. Nenhum peso ou preço anterior é presumido.
4. Para promoções, informe o preço atual e o preço anterior, que deve ser maior. Promoções antigas sem preço anterior não mostram comparação até serem atualizadas.
5. Nos dados do estabelecimento, informe o link HTTPS da imagem da logo. Se o link estiver vazio ou a imagem falhar, aparecem as iniciais do mercado.

O estoque e o carrinho continuam contando embalagens ou porções inteiras. Por exemplo, 2 itens de arroz de 1 kg representam duas embalagens, e 2 itens de carne de 500 g representam duas porções de 500 g. Não há seleção livre de peso fracionado nesta atualização.

Verificação manual após atualizar o banco
---------------------------------------

- Entre com um cliente e com um fornecedor e confira nome/e-mail no cabeçalho; teste também Sair e a navegação como visitante.
- Cadastre e edite produtos de 1 kg, 500 g e 1 unidade. Recarregue a página para conferir a persistência.
- Ative uma promoção e tente informar preço anterior menor ou igual ao atual: o formulário deve impedir o envio. Desative a promoção e confira o preço normal.
- Alterne as categorias e adicione um produto de cada aba ao carrinho: o produto e seu conteúdo devem corresponder à seleção.
- Teste logo válida, campo vazio e endereço de imagem inexistente.
- Confira os botões no celular e no computador e conclua uma solicitação de teste.

O repositório contém apenas a chave pública do Supabase. A migração não é aplicada automaticamente pelo site.
