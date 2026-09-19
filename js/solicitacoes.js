const lista =
    document.getElementById(
        "listaPedidosCliente"
    );


// ==========================================
// MOSTRAR SOLICITAÇÕES DO CLIENTE
// ==========================================

async function mostrarSolicitacoes() {

    lista.innerHTML =
        "<p>Carregando solicitações...</p>";


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
            "Faça login para ver suas solicitações."
        );

        window.location.href =
            "cliente-login.html";

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
                "cliente_id",
                usuario.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        lista.innerHTML =
            "<p>Erro ao carregar solicitações.</p>";

        console.log(error);

        return;
    }


    lista.innerHTML = "";


    if (
        !pedidos ||
        pedidos.length === 0
    ) {

        lista.innerHTML =
            "<p>Você ainda não possui solicitações.</p>";

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

                        " - " +

                        item.quantidade +

                        " unidade(s)" +

                        "</li>";

                }
            );


            const dataPedido =
                new Date(
                    pedido.created_at
                ).toLocaleString(
                    "pt-BR"
                );


            lista.innerHTML +=

                "<div class='pedido'>" +

                "<h3>Solicitação #" +
                pedido.id +
                "</h3>" +

                "<p><strong>Cliente / retirada:</strong> " +
                Catalogo.escapar(pedido.nome_cliente || "Nome não informado") +
                "</p>" +

                "<p>Na retirada, informe o nome e o número desta solicitação.</p>" +

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

                "<p>Status: <strong>" +
                pedido.status +
                "</strong></p>" +

                "</div>";

        }
    );

}


mostrarSolicitacoes();
