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


    const fornecedorId =
        localStorage.getItem(
            "mercadinhoSelecionado"
        );


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


    listaProdutosCliente.innerHTML = "";


    if (produtos.length === 0) {

        listaProdutosCliente.innerHTML =
            "<p>Nenhum produto disponível no momento.</p>";

        return;
    }


    produtos.forEach(
        function(produto, indice) {

            const imagem =
                encontrarImagem(
                    produto.nome
                );


            let imagemProduto = "";


            if (imagem) {

                imagemProduto = `

                    <img
                        src="${imagem}"
                        alt="${produto.nome}"
                        class="imagem-produto"
                    >

                `;

            }

            else {

                imagemProduto = `

                    <div class="sem-imagem">
                        📦 Produto sem imagem
                    </div>

                `;

            }


            listaProdutosCliente.innerHTML += `

                <div class="produto">

                    ${imagemProduto}

                    <h3>
                        ${produto.nome}
                    </h3>

                    <p>
                        Preço:
                        R$ ${Number(produto.preco)
                            .toFixed(2)
                            .replace(".", ",")}
                    </p>

                    <p>
                        Estoque disponível:
                        ${produto.estoque}
                    </p>

                    <p>
                        Promoção:
                        ${
                            produto.promocao
                                ? "Sim"
                                : "Não"
                        }
                    </p>

                    <button
                        onclick="adicionarAoCarrinho(${indice})"
                    >
                        🛒 Adicionar à lista
                    </button>

                </div>

            `;

        }
    );

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