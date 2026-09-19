// ==========================================
// SAIR DO FORNECEDOR
// ==========================================

const botaoSairFornecedor =
    document.getElementById("sairFornecedor");

if (botaoSairFornecedor) {

    botaoSairFornecedor.addEventListener(
        "click",
        async function() {

            await supabaseClient.auth.signOut();

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// PEDIDOS DO FORNECEDOR
// ==========================================

const listaPedidos =
    document.getElementById("listaPedidos");


async function mostrarPedidos() {

    if (!listaPedidos) {
        return;
    }


    listaPedidos.innerHTML =
        "<p>Carregando pedidos...</p>";


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


    const {
        data: pedidos,
        error
    } =
        await supabaseClient
            .from("pedidos")
            .select(`
                id,
                nome_cliente,
                total,
                status,
                created_at,
                itens_pedido (
                    quantidade,
                    preco,
                    produtos (
                        nome
                    )
                )
            `)
            .eq(
                "fornecedor_id",
                usuario.id
            )
            .neq("status", "Retirado")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        listaPedidos.innerHTML =
            "<p>Erro ao carregar pedidos.</p>";

        console.log(error);

        return;
    }


    listaPedidos.innerHTML = "";


    if (
        !pedidos ||
        pedidos.length === 0
    ) {

        listaPedidos.innerHTML =
            "<p>Nenhum pedido aguardando retirada.</p>";

        return;
    }


    pedidos.forEach(
        function(pedido) {

            let produtos = "";


            pedido.itens_pedido.forEach(
                function(item) {

                    const nome =
                        item.produtos
                        ? item.produtos.nome
                        : "Produto";


                    produtos +=

                        "<li>" +

                        nome +

                        " - Quantidade: " +

                        item.quantidade +

                        "</li>";

                }
            );


            const dataPedido =
                new Date(
                    pedido.created_at
                ).toLocaleString(
                    "pt-BR"
                );


            const divPedido =
                document.createElement("div");


            divPedido.className =
                "pedido";


            divPedido.innerHTML =

                "<h3>Pedido #" +
                pedido.id +
                "</h3>" +

                "<p><strong>Cliente / retirada:</strong> " +
                Catalogo.escapar(pedido.nome_cliente || "Nome não informado") +
                "</p>" +

                "<p>Data: " +
                dataPedido +
                "</p>" +

                "<h4>Produtos:</h4>" +

                "<ul>" +
                produtos +
                "</ul>" +

                "<p>Total estimado: R$ " +
                Number(pedido.total)
                    .toFixed(2)
                    .replace(".", ",") +
                "</p>" +

                "<p>Status atual: <strong>" +
                pedido.status +
                "</strong></p>" +

                "<div class='acoes-pedido'>" +
                "<label for='status-pedido-" + pedido.id + "'>Novo status:</label>" +

                "<select class='status' id='status-pedido-" + pedido.id + "'>" +

                "<option value='Pendente'>" +
                "Pendente" +
                "</option>" +

                "<option value='Em preparação'>" +
                "Em preparação" +
                "</option>" +

                "<option value='Pronto para retirada'>" +
                "Pronto para retirada" +
                "</option>" +

                "<option value='Retirado'>" +
                "Retirado" +
                "</option>" +

                "</select>" +

                "<button type='button' class='botaoStatus'>" +
                "Alterar status" +
                "</button></div>";


            listaPedidos.appendChild(
                divPedido
            );


            const select =
                divPedido.querySelector(
                    ".status"
                );


            const botao =
                divPedido.querySelector(
                    ".botaoStatus"
                );


            select.value =
                pedido.status;


            botao.addEventListener(
                "click",
                function() {

                    alterarStatus(
                        pedido.id,
                        select.value
                    );

                }
            );

        }
    );

}


// ==========================================
// ALTERAR STATUS DO PEDIDO
// ==========================================

async function alterarStatus(
    id,
    novoStatus
) {

    const { error } =
        await supabaseClient
            .from("pedidos")
            .update({

                status:
                    novoStatus

            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Erro ao alterar o status."
        );

        console.log(error);

        return;
    }


    alert(
        "Status alterado com sucesso!"
    );


    mostrarPedidos();

}


// ==========================================
// DADOS DO ESTABELECIMENTO
// ==========================================

const formEstabelecimento =
    document.getElementById(
        "formEstabelecimento"
    );


// ==========================================
// CARREGAR ESTABELECIMENTO
// ==========================================

async function carregarEstabelecimento() {

    if (!formEstabelecimento) {
        return;
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

        return;
    }


    const usuario =
        usuarioData.user;


    const {
        data: estabelecimento,
        error
    } =
        await supabaseClient
            .from("estabelecimentos")
            .select("*")
            .eq(
                "fornecedor_id",
                usuario.id
            )
            .maybeSingle();


    if (error) {

        console.log(error);

        return;
    }


    if (!estabelecimento) {
        return;
    }


    document.getElementById("logoUrl").value = estabelecimento.logo_url || "";
    document.getElementById(
        "nomeFantasia"
    ).value =
        estabelecimento.nome_fantasia || "";


    document.getElementById(
        "endereco"
    ).value =
        estabelecimento.endereco || "";


    document.getElementById(
        "telefone"
    ).value =
        estabelecimento.telefone || "";


    document.getElementById(
        "horario"
    ).value =
        estabelecimento.horario || "";


    document.getElementById(
        "descricao"
    ).value =
        estabelecimento.descricao || "";

    atualizarPreviaLogo();

}


// ==========================================
// SALVAR ESTABELECIMENTO
// ==========================================

if (formEstabelecimento) {

    formEstabelecimento.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const botaoSalvar = formEstabelecimento.querySelector('button[type="submit"]');
            if (botaoSalvar.disabled) return;
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";
            try {

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

                return;
            }


            const usuario =
                usuarioData.user;


            const logoUrl = await FotoEstabelecimento.enviar(usuario.id);
            if (logoUrl && !Catalogo.urlImagem(logoUrl)) {
                alert("Informe um endereço HTTPS válido para a logo.");
                return;
            }
            const nomeFantasia =
                document.getElementById(
                    "nomeFantasia"
                ).value;


            const endereco =
                document.getElementById(
                    "endereco"
                ).value;


            const telefone =
                document.getElementById(
                    "telefone"
                ).value;


            const horario =
                document.getElementById(
                    "horario"
                ).value;


            const descricao =
                document.getElementById(
                    "descricao"
                ).value;


            const {
                data: estabelecimento,
                error: erroBusca
            } =
                await supabaseClient
                    .from("estabelecimentos")
                    .select("id")
                    .eq(
                        "fornecedor_id",
                        usuario.id
                    )
                    .maybeSingle();


            if (erroBusca) {

                alert(
                    "Erro ao buscar estabelecimento."
                );

                console.log(erroBusca);

                return;
            }


            // EDITAR
            if (estabelecimento) {

                const { error } =
                    await supabaseClient
                        .from("estabelecimentos")
                        .update({

                            nome_fantasia:
                                nomeFantasia,

                            endereco:
                                endereco,

                            telefone:
                                telefone,

                            horario:
                                horario,

                            descricao:
                                descricao,
                            logo_url: logoUrl || null

                        })
                        .eq(
                            "id",
                            estabelecimento.id
                        );


                if (error) {

                    alert(
                        "Erro ao atualizar estabelecimento."
                    );

                    console.log(error);

                    return;
                }

            }

            // CADASTRAR
            else {

                const { error } =
                    await supabaseClient
                        .from("estabelecimentos")
                        .insert({

                            fornecedor_id:
                                usuario.id,

                            nome_fantasia:
                                nomeFantasia,

                            endereco:
                                endereco,

                            telefone:
                                telefone,

                            horario:
                                horario,

                            descricao:
                                descricao,
                            logo_url: logoUrl || null

                        });


                if (error) {

                    alert(
                        "Erro ao cadastrar estabelecimento."
                    );

                    console.log(error);

                    return;
                }

            }


            alert(
                "Informações do estabelecimento salvas!"
            );


            await carregarEstabelecimento();

            } catch (erro) {
                alert(erro.message || "Não foi possível salvar o estabelecimento. Tente novamente.");
            } finally {
                botaoSalvar.disabled = false;
                botaoSalvar.textContent = "Salvar informações";
            }

        }
    );

}


// ==========================================
// INICIAR
// ==========================================

mostrarPedidos();

carregarEstabelecimento();
function atualizarPreviaLogo() {
    if (FotoEstabelecimento.mostrarPrevia()) return;
    Catalogo.logo(document.getElementById("previaLogo"), {
        nome_fantasia: document.getElementById("nomeFantasia").value || "Mercadinho",
        logo_url: document.getElementById("logoUrl").value
    });
}
document.getElementById("logoUrl").addEventListener("input", atualizarPreviaLogo);
document.getElementById("nomeFantasia").addEventListener("input", atualizarPreviaLogo);
atualizarPreviaLogo();
