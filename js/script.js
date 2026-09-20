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


    atualizarSugestoesNome();
}

function atualizarSugestoesNome() {
    sugestoesProdutos.replaceChildren();
    const nomes = SugestoesNome.buscar(campoNomeProduto.value, catalogoImagens);
    sugestoesProdutos.hidden = nomes.length === 0;
    document.getElementById("estadoSugestoesNome").textContent = nomes.length
        ? "Sugestões disponíveis. Selecione o nome desejado abaixo."
        : "";
    for (const nome of nomes) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao-secundario";
        botao.textContent = nome;
        botao.addEventListener("click", () => {
            campoNomeProduto.value = nome;
            sugestoesProdutos.replaceChildren();
            sugestoesProdutos.hidden = true;
            document.getElementById("estadoSugestoesNome").textContent = "Produto selecionado: " + nome;
            campoNomeProduto.focus();
        });
        sugestoesProdutos.appendChild(botao);
    }
}

campoNomeProduto.addEventListener("input", atualizarSugestoesNome);
formulario.addEventListener("reset", () => {
    sugestoesProdutos.replaceChildren();
    sugestoesProdutos.hidden = true;
    document.getElementById("estadoSugestoesNome").textContent = "";
});

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


    listaProdutos.innerHTML = produtos.map(produto => `
        <article class="produto produto-fornecedor">
            <div class="produto-identificacao">
                <h3>${Catalogo.escapar(produto.nome)}</h3>
                <p>${Catalogo.escapar(produto.categoria || "Outros")} · ${Catalogo.escapar(Catalogo.medida(produto))}</p>
            </div>
            <div class="produto-valores">
                ${Catalogo.preco(produto)}
                <p>Promoção: ${produto.promocao ? "Sim" : "Não"}</p>
            </div>
            <div class="produto-estoque">
                <p><strong>Estoque: ${Catalogo.escapar(produto.estoque)}</strong>
                    <span class="estoque-unidade">embalagens/porções</span></p>
                <p class="produto-disponibilidade ${Number(produto.estoque) > 0 ? "disponivel" : "esgotado"}">
                    ${Number(produto.estoque) > 0 ? "Disponível" : "Esgotado"}
                </p>
            </div>
            <div class="acoes-card" role="group" aria-label="Ações de ${Catalogo.escapar(produto.nome)}">
                <button type="button" class="botao-secundario" onclick="editarProduto(${produto.id})">Editar</button>
                <button type="button" class="botao-perigo" onclick="excluirProduto(${produto.id})">Excluir</button>
            </div>
        </article>
    `).join("");
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
    atualizarSugestoesNome();


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
