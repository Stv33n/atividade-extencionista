const formulario =
    document.getElementById("formProduto");

const listaProdutos =
    document.getElementById("listaProdutos");

const campoNomeProduto =
    document.getElementById("nome");

const sugestoesProdutos =
    document.getElementById("sugestoesProdutos");


let produtos = [];

let catalogoImagens = [];

let produtoEditandoId = null;


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
// CARREGAR SUGESTÕES DE PRODUTOS
// ==========================================

async function carregarSugestoesProdutos() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("imagens_produtos")
            .select(
                "nome_produto, imagem_url"
            )
            .order(
                "nome_produto",
                {
                    ascending: true
                }
            );


    if (error) {

        console.log(
            "Erro ao carregar sugestões:",
            error
        );

        return;
    }


    catalogoImagens =
        data || [];


    sugestoesProdutos.innerHTML = "";


    catalogoImagens.forEach(
        function(produto) {

            const option =
                document.createElement("option");

            option.value =
                produto.nome_produto;

            sugestoesProdutos.appendChild(
                option
            );

        }
    );

}


// ==========================================
// MOSTRAR PRODUTOS
// ==========================================

async function mostrarProdutos() {

    listaProdutos.innerHTML =
        "<p>Carregando produtos...</p>";


    const {
        data: usuarioData,
        error: erroUsuario
    } =
        await supabaseClient.auth.getUser();


    if (erroUsuario || !usuarioData.user) {

        alert(
            "Faça login para acessar os produtos."
        );

        window.location.href =
            "fornecedor-login.html";

        return;
    }


    const usuario =
        usuarioData.user;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .eq(
                "fornecedor_id",
                usuario.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.log(error);

        listaProdutos.innerHTML =
            "<p>Erro ao carregar produtos.</p>";

        return;
    }


    produtos =
        data || [];


    listaProdutos.innerHTML = "";


    if (produtos.length === 0) {

        listaProdutos.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;
    }


    produtos.forEach(
        function(produto) {

            const promocao =
                produto.promocao
                    ? "Sim"
                    : "Não";


            listaProdutos.innerHTML += `

                <div class="produto">

                    <h3>
                        ${Catalogo.escapar(produto.nome)}
                    </h3>

                    ${Catalogo.preco(produto)}<p>${Catalogo.escapar(Catalogo.medida(produto))} · ${Catalogo.escapar(produto.categoria || "Outros")}</p>

                    <p>
                        Estoque:
                        ${produto.estoque} embalagem(ns)/porção(ões)
                    </p>

                    <p>
                        Disponibilidade:
                        ${
                            Number(produto.estoque) > 0
                                ? "Disponível"
                                : "Esgotado"
                        }
                    </p>

                    <p>
                        Promoção:
                        ${promocao}
                    </p>

                    <div class="acoes-card" role="group" aria-label="Ações do produto">
                    <button type="button" class="botao-secundario"
                        onclick="editarProduto(${produto.id})"
                    >
                        Editar
                    </button>

                    <button type="button" class="botao-perigo"
                        onclick="excluirProduto(${produto.id})"
                    >
                        Excluir
                    </button>
                    </div>

                </div>

            `;

        }
    );

}


// ==========================================
// CADASTRAR / EDITAR PRODUTO
// ==========================================

formulario.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        let nome =
            document
                .getElementById("nome")
                .value
                .trim();

        const preco =
            document.getElementById("preco").value;

        const estoque =
            document.getElementById("estoque").value;

        const promocao =
            document.getElementById("promocao").value;


        const detalhes = {
            categoria: document.getElementById("categoria").value,
            conteudo: Number(document.getElementById("conteudo").value),
            unidade: document.getElementById("unidade").value,
            preco_anterior: promocao === "sim" ? Number(document.getElementById("precoAnterior").value) : null
        };
        if (promocao === "sim" && !(detalhes.preco_anterior > Number(preco))) {
            alert("O preço anterior deve ser maior que o preço atual da promoção.");
            return;
        }
        // ==================================
        // PROCURAR PRODUTO NO CATÁLOGO
        // ==================================

        const nomeNormalizado =
            normalizarTexto(nome);


        const produtoEncontrado =
            catalogoImagens.find(
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

            console.log(
                "Produto reconhecido:",
                produtoEncontrado.nome_produto
            );

            console.log(
                "Imagem:",
                produtoEncontrado.imagem_url
            );

        }

        else {

            console.log(
                "Produto ainda não possui imagem cadastrada."
            );

        }


        const {
            data: usuarioData,
            error: erroUsuario
        } =
            await supabaseClient.auth.getUser();


        if (
            erroUsuario ||
            !usuarioData.user
        ) {

            alert(
                "Faça login novamente."
            );

            window.location.href =
                "fornecedor-login.html";

            return;
        }


        const usuario =
            usuarioData.user;


        // ==================================
        // EDITAR
        // ==================================

        if (produtoEditandoId !== null) {

            const { error } =
                await supabaseClient
                    .from("produtos")
                    .update({

                        nome: nome,

                        preco:
                            Number(preco),

                        estoque:
                            Number(estoque),

                        promocao:
                            promocao === "sim",
                        ...detalhes

                    })
                    .eq(
                        "id",
                        produtoEditandoId
                    );


            if (error) {

                alert(
                    "Erro ao editar produto."
                );

                console.log(error);

                return;
            }


            alert(
                "Produto atualizado com sucesso!"
            );


            produtoEditandoId =
                null;

        }


        // ==================================
        // CADASTRAR
        // ==================================

        else {

            const { error } =
                await supabaseClient
                    .from("produtos")
                    .insert({

                        fornecedor_id:
                            usuario.id,

                        nome:
                            nome,

                        preco:
                            Number(preco),

                        estoque:
                            Number(estoque),

                        promocao:
                            promocao === "sim",
                        ...detalhes

                    });


            if (error) {

                alert(
                    "Erro ao cadastrar produto."
                );

                console.log(error);

                return;
            }


            alert(
                "Produto cadastrado com sucesso!"
            );

        }


        formulario.reset();
        atualizarCampoPromocao();
        formulario.querySelector('button[type="submit"]').textContent = "Cadastrar produto";

        mostrarProdutos();

    }
);


// ==========================================
// EDITAR PRODUTO
// ==========================================

function editarProduto(id) {

    const produto =
        produtos.find(
            function(produto) {

                return produto.id === id;

            }
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;
    }


    document.getElementById("nome").value =
        produto.nome;

    document.getElementById("preco").value =
        produto.preco;

    document.getElementById("estoque").value =
        produto.estoque;

    document.getElementById("promocao").value =
        produto.promocao
            ? "sim"
            : "nao";


    document.getElementById("categoria").value = produto.categoria || "Outros";
    document.getElementById("conteudo").value = produto.conteudo || "";
    document.getElementById("unidade").value = produto.unidade || "un";
    document.getElementById("precoAnterior").value = produto.preco_anterior || "";
    atualizarCampoPromocao();
    formulario.querySelector('button[type="submit"]').textContent = "Salvar alterações";
    produtoEditandoId = produto.id;


    formulario.scrollIntoView({

        behavior:
            "smooth"

    });

}


// ==========================================
// EXCLUIR PRODUTO
// ==========================================

async function excluirProduto(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este produto?"
        );


    if (!confirmar) {

        return;

    }


    const { error } =
        await supabaseClient
            .from("produtos")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Erro ao excluir produto:\n" +
            error.message
        );

        console.log(error);

        return;
    }


    alert(
        "Produto excluído com sucesso!"
    );


    mostrarProdutos();

}


// ==========================================
// INICIAR
// ==========================================

carregarSugestoesProdutos();

mostrarProdutos();
function atualizarCampoPromocao() {
    const ativa = document.getElementById("promocao").value === "sim";
    document.getElementById("grupoPrecoAnterior").hidden = !ativa;
    const campo = document.getElementById("precoAnterior");
    campo.disabled = !ativa;
    campo.required = ativa;
}
document.getElementById("promocao").addEventListener("change", atualizarCampoPromocao);
atualizarCampoPromocao();
