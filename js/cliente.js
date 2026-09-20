const listaProdutosCliente =
    document.getElementById("listaProdutosCliente");


let produtos = [];

let catalogoImagens = [];


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ==========================================
// CARREGAR CATÁLOGO DE IMAGENS
// ==========================================

async function carregarCatalogoImagens() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("imagens_produtos")
            .select(
                "nome_produto, imagem_url"
            );


    if (error) {

        console.log(
            "Erro ao carregar imagens:",
            error
        );

        catalogoImagens = [];

        return;
    }


    catalogoImagens =
        data || [];

}


// ==========================================
// ENCONTRAR IMAGEM DO PRODUTO
// ==========================================

function encontrarImagem(nomeProduto) {

    const nomeNormalizado =
        normalizarTexto(
            nomeProduto
        );


    // Coloca os nomes maiores primeiro.
    // Exemplo:
    // "Leite Líquido" antes de "Leite".
    const catalogoOrdenado =
        [...catalogoImagens]
            .sort(
                function(a, b) {

                    return (
                        normalizarTexto(
                            b.nome_produto
                        ).length
                        -
                        normalizarTexto(
                            a.nome_produto
                        ).length
                    );

                }
            );


    const produtoEncontrado =
        catalogoOrdenado.find(
            function(item) {

                const nomeCatalogo =
                    normalizarTexto(
                        item.nome_produto
                    );


                return (
                    nomeNormalizado.includes(
                        nomeCatalogo
                    ) ||
                    nomeCatalogo.includes(
                        nomeNormalizado
                    )
                );

            }
        );


    if (produtoEncontrado) {

        return produtoEncontrado.imagem_url;

    }


    return null;

}


// ==========================================
// MOSTRAR PRODUTOS
// ==========================================

async function mostrarProdutos() {

    listaProdutosCliente.innerHTML =
        "<p>Carregando produtos...</p>";


    const mercadoDoLink = new URLSearchParams(window.location.search).get("mercado");
    const fornecedorId = mercadoDoLink ||
        localStorage.getItem(
            "mercadinhoSelecionado"
        );

    if (mercadoDoLink) localStorage.setItem("mercadinhoSelecionado", mercadoDoLink);


    if (!fornecedorId) {

        listaProdutosCliente.innerHTML =
            "<p>Escolha um mercadinho primeiro.</p>";

        return;
    }


    // Primeiro carrega as imagens
    await carregarCatalogoImagens();


    const {
        data,
        error
    } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .eq(
                "fornecedor_id",
                fornecedorId
            )
            .order(
                "nome",
                {
                    ascending: true
                }
            );


    if (error) {

        listaProdutosCliente.innerHTML =
            "<p>Erro ao carregar produtos.</p>";

        console.log(error);

        return;
    }


    produtos =
        data || [];


    criarCategorias();
    renderizarProdutos();
}

// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================

function adicionarAoCarrinho(indice) {

    const produto =
        produtos[indice];


    if (
        Number(produto.estoque) <= 0
    ) {

        alert(
            "Este produto está esgotado no momento."
        );

        return;
    }


    let carrinho =
        JSON.parse(
            localStorage.getItem("carrinho")
        ) || [];


    const produtoExistente =
        carrinho.find(
            function(item) {

                return item.id === produto.id;

            }
        );


    if (produtoExistente) {

        if (
            produtoExistente.quantidade <
            Number(produto.estoque)
        ) {

            produtoExistente.quantidade++;

        }

        else {

            alert(
                "Não é possível adicionar mais. Estoque insuficiente."
            );

            return;
        }

    }

    else {

        carrinho.push({

            id:
                produto.id,

            conteudo: produto.conteudo,
            unidade: produto.unidade,
            fornecedor_id:
                produto.fornecedor_id,

            nome:
                produto.nome,

            preco:
                Number(produto.preco),

            quantidade:
                1

        });

    }


    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );


    alert(
        produto.nome +
        " foi adicionado à lista!"
    );

}


// ==========================================
// INICIAR
// ==========================================

mostrarProdutos();
