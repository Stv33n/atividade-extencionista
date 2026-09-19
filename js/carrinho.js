const listaCarrinho =
    document.getElementById("listaCarrinho");

const totalItens =
    document.getElementById("totalItens");

const totalCompra =
    document.getElementById("totalCompra");

const botaoFinalizar =
    document.getElementById("finalizarCompra");


let carrinho =
    JSON.parse(
        localStorage.getItem("carrinho")
    ) || [];


let estoques = {};

let temporizadorQuantidade = null;
let intervaloQuantidade = null;


// ==========================================
// FORMATAR PREÇO
// ==========================================

function formatarPreco(valor) {

    return Number(valor)
        .toFixed(2)
        .replace(".", ",");

}


// ==========================================
// SALVAR CARRINHO
// ==========================================

function salvarCarrinho() {

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

}


// ==========================================
// CARREGAR ESTOQUES
// ==========================================

async function carregarEstoques() {

    if (carrinho.length === 0) {
        return;
    }


    const ids =
        carrinho.map(
            function(item) {
                return item.id;
            }
        );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .in("id", ids);


    if (error) {

        console.log(
            "Erro ao carregar estoques:",
            error
        );

        return;
    }


    estoques = {};


    data.forEach(
        function(produto) {

            estoques[produto.id] =
                Number(produto.estoque);

            const item = carrinho.find(item => item.id === produto.id);
            if (item) {
                item.conteudo = produto.conteudo;
                item.unidade = produto.unidade;
            }

        }
    );

}


// ==========================================
// MOSTRAR CARRINHO
// ==========================================

async function mostrarCarrinho() {

    listaCarrinho.innerHTML =
        "<p>Carregando carrinho...</p>";


    if (carrinho.length === 0) {

        listaCarrinho.innerHTML =
            "<p>Seu carrinho está vazio.</p>";

        atualizarResumo();

        return;
    }


    await carregarEstoques();


    listaCarrinho.innerHTML = "";


    carrinho.forEach(
        function(item, indice) {

            const estoque =
                estoques[item.id] ?? 0;

            const subtotal =
                Number(item.preco) *
                Number(item.quantidade);


            const div =
                document.createElement("div");


            div.className =
                "produto";


            div.id =
                "produtoCarrinho-" +
                indice;


            div.innerHTML = `

                <h3>
                    ${Catalogo.escapar(item.nome)}
                </h3>

                <p>${Catalogo.escapar(Catalogo.medida(item))}</p>
                <p>
                    Preço:
                    R$ ${formatarPreco(item.preco)}
                </p>

                <p>
                    ${estoque > 0 ? "Disponível" : "Esgotado"}
                </p>

                <p>
                    Quantidade:
                </p>

                <input
                    type="number"
                    id="quantidade-${indice}"
                    min="1"
                    value="${item.quantidade}"
                >

                <button
                    class="botao-menos"
                    data-indice="${indice}"
                >
                    -
                </button>

                <button
                    class="botao-mais"
                    data-indice="${indice}"
                >
                    +
                </button>

                <p>
                    Subtotal:
                    R$
                    <span id="subtotal-${indice}">
                        ${formatarPreco(subtotal)}
                    </span>
                </p>

                <button
                    class="botao-remover"
                    data-indice="${indice}"
                >
                    Remover
                </button>

            `;


            listaCarrinho.appendChild(
                div
            );

        }
    );


    adicionarEventosCarrinho();

    atualizarResumo();

}


// ==========================================
// EVENTOS DOS CARDS
// ==========================================

function adicionarEventosCarrinho() {

    const botoesMais =
        document.querySelectorAll(
            ".botao-mais"
        );

    const botoesMenos =
        document.querySelectorAll(
            ".botao-menos"
        );

    const botoesRemover =
        document.querySelectorAll(
            ".botao-remover"
        );


    botoesMais.forEach(
        function(botao) {

            const indice =
                Number(
                    botao.dataset.indice
                );


            botao.addEventListener(
                "pointerdown",
                function(event) {

                    event.preventDefault();

                    iniciarAlteracao(
                        indice,
                        1
                    );

                }
            );

        }
    );


    botoesMenos.forEach(
        function(botao) {

            const indice =
                Number(
                    botao.dataset.indice
                );


            botao.addEventListener(
                "pointerdown",
                function(event) {

                    event.preventDefault();

                    iniciarAlteracao(
                        indice,
                        -1
                    );

                }
            );

        }
    );


    botoesRemover.forEach(
        function(botao) {

            const indice =
                Number(
                    botao.dataset.indice
                );


            botao.addEventListener(
                "click",
                function() {

                    removerDoCarrinho(
                        indice
                    );

                }
            );

        }
    );


    carrinho.forEach(
        function(item, indice) {

            const input =
                document.getElementById(
                    "quantidade-" +
                    indice
                );


            input.addEventListener(
                "change",
                function() {

                    alterarQuantidadeDigitada(
                        indice,
                        this.value
                    );

                }
            );

        }
    );

}


// ==========================================
// ALTERAR QUANTIDADE
// ==========================================

function alterarQuantidade(
    indice,
    diferenca
) {

    const item =
        carrinho[indice];


    if (!item) {
        return false;
    }


    const estoque =
        estoques[item.id] ?? 0;


    const novaQuantidade =
        Number(item.quantidade) +
        diferenca;


    // Não deixa remover usando o botão -
    if (novaQuantidade < 1) {

        pararAlteracao();

        return false;
    }


    if (
        novaQuantidade >
        estoque
    ) {

        pararAlteracao();

        return false;
    }


    item.quantidade =
        novaQuantidade;


    salvarCarrinho();

    atualizarProduto(
        indice
    );

    atualizarResumo();


    return true;

}


// ==========================================
// DIGITAR QUANTIDADE
// ==========================================

function alterarQuantidadeDigitada(
    indice,
    valor
) {

    const item =
        carrinho[indice];


    if (!item) {
        return;
    }


    let quantidade =
        Number(valor);


    const estoque =
        estoques[item.id] ?? 0;


    if (
        !Number.isInteger(quantidade) ||
        quantidade < 1
    ) {

        quantidade = 1;

    }


    if (
        quantidade >
        estoque
    ) {

        alert(
            "A quantidade solicitada excede a disponibilidade deste produto."
        );

        quantidade =
            estoque;

    }


    item.quantidade =
        quantidade;


    salvarCarrinho();

    atualizarProduto(
        indice
    );

    atualizarResumo();

}


// ==========================================
// ATUALIZAR SOMENTE O PRODUTO
// ==========================================

function atualizarProduto(indice) {

    const item =
        carrinho[indice];


    if (!item) {
        return;
    }


    const input =
        document.getElementById(
            "quantidade-" +
            indice
        );


    const subtotal =
        document.getElementById(
            "subtotal-" +
            indice
        );


    if (input) {

        input.value =
            item.quantidade;

    }


    if (subtotal) {

        subtotal.textContent =
            formatarPreco(
                Number(item.preco) *
                Number(item.quantidade)
            );

    }

}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    let quantidadeTotal = 0;
    let valorTotal = 0;


    carrinho.forEach(
        function(item) {

            quantidadeTotal +=
                Number(
                    item.quantidade
                );


            valorTotal +=
                Number(item.preco) *
                Number(item.quantidade);

        }
    );


    totalItens.textContent =
        quantidadeTotal;


    totalCompra.textContent =
        formatarPreco(
            valorTotal
        );

}


// ==========================================
// SEGURAR + OU -
// ==========================================

function iniciarAlteracao(
    indice,
    diferenca
) {

    pararAlteracao();


    // Primeiro clique
    alterarQuantidade(
        indice,
        diferenca
    );


    // Só começa repetição se segurar
    temporizadorQuantidade =
        setTimeout(
            function() {

                intervaloQuantidade =
                    setInterval(
                        function() {

                            const alterou =
                                alterarQuantidade(
                                    indice,
                                    diferenca
                                );


                            if (!alterou) {

                                pararAlteracao();

                            }

                        },
                        180
                    );

            },
            450
        );

}


// ==========================================
// PARAR ALTERAÇÃO
// ==========================================

function pararAlteracao() {

    clearTimeout(
        temporizadorQuantidade
    );

    clearInterval(
        intervaloQuantidade
    );


    temporizadorQuantidade =
        null;

    intervaloQuantidade =
        null;

}


// Para mesmo se soltar fora do botão
window.addEventListener(
    "pointerup",
    pararAlteracao
);

window.addEventListener(
    "pointercancel",
    pararAlteracao
);

window.addEventListener(
    "blur",
    pararAlteracao
);


// ==========================================
// REMOVER PRODUTO
// ==========================================

function removerDoCarrinho(indice) {

    pararAlteracao();


    carrinho.splice(
        indice,
        1
    );


    salvarCarrinho();

    mostrarCarrinho();

}


// ==========================================
// SOLICITAR RETIRADA
// ==========================================

botaoFinalizar.addEventListener(
    "click",
    async function() {

        if (
            carrinho.length === 0
        ) {

            alert(
                "Seu carrinho está vazio!"
            );

            return;
        }


        const {
            data: usuarioData,
            error: erroUsuario
        } =
            await supabaseClient
                .auth
                .getUser();


        if (
            erroUsuario ||
            !usuarioData.user
        ) {

            localStorage.setItem(
                "paginaDepoisLogin",
                "carrinho.html"
            );


            alert(
                "Faça login ou crie uma conta para continuar."
            );


            window.location.href =
                "cliente-login.html";


            return;
        }


        // Produtos antigos/inválidos
        const produtoInvalido =
            carrinho.some(
                function(item) {

                    return (
                        !item.id ||
                        !item.fornecedor_id
                    );

                }
            );


        if (produtoInvalido) {

            alert(
                "Existem produtos antigos no carrinho.\n\n" +
                "Esvazie o carrinho e adicione os produtos novamente."
            );

            return;
        }


        const fornecedorId =
            carrinho[0]
                .fornecedor_id;


        // Não mistura mercadinhos
        const outroFornecedor =
            carrinho.some(
                function(item) {

                    return (
                        item.fornecedor_id !==
                        fornecedorId
                    );

                }
            );


        if (outroFornecedor) {

            alert(
                "Não é possível solicitar produtos de " +
                "mercadinhos diferentes no mesmo pedido."
            );

            return;
        }


        const itens =
            carrinho.map(
                function(item) {

                    return {

                        produto_id:
                            item.id,

                        quantidade:
                            Number(
                                item.quantidade
                            )

                    };

                }
            );


        botaoFinalizar.disabled =
            true;


        const {
            data: numeroPedido,
            error
        } =
            await supabaseClient.rpc(
                "criar_pedido_publico",
                {

                    p_fornecedor_id:
                        fornecedorId,

                    p_itens:
                        itens

                }
            );


        botaoFinalizar.disabled =
            false;


        if (error) {

            alert(
                "Não foi possível enviar a solicitação.\n\n" +
                error.message
            );

            console.log(error);

            return;
        }


        carrinho = [];

        salvarCarrinho();

        mostrarCarrinho();


        alert(
            "Solicitação #" +
            numeroPedido +
            " enviada com sucesso!\n\n" +
            "Aguarde o mercadinho preparar os produtos.\n" +
            "O pagamento será realizado diretamente no mercadinho."
        );

    }
);


// ==========================================
// INICIAR
// ==========================================

mostrarCarrinho();
