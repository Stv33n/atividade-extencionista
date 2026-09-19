const listaMercadinhos =
    document.getElementById("listaMercadinhos");


// ==========================================
// MOSTRAR MERCADINHOS
// ==========================================

async function mostrarMercadinhos() {

    listaMercadinhos.innerHTML =
        "<p>Carregando mercadinhos...</p>";


    const {
        data: estabelecimentos,
        error
    } =
        await supabaseClient
            .from("estabelecimentos")
            .select("*")
            .order(
                "nome_fantasia",
                {
                    ascending: true
                }
            );


    if (error) {

        listaMercadinhos.innerHTML =
            "<p>Erro ao carregar mercadinhos.</p>";

        console.log(error);

        return;
    }


    listaMercadinhos.innerHTML = "";


    if (
        !estabelecimentos ||
        estabelecimentos.length === 0
    ) {

        listaMercadinhos.innerHTML =
            "<p>Nenhum mercadinho disponível.</p>";

        return;
    }


    estabelecimentos.forEach(
        function(estabelecimento) {

            const div =
                document.createElement("div");


            div.className =
                "card-mercadinho";


            div.innerHTML = `

                <div class="topo-mercadinho">

                    <div class="icone-mercadinho">
                        🏪
                    </div>

                    <div class="info-mercadinho">

                        <h3>
                            ${Catalogo.escapar(estabelecimento.nome_fantasia)}
                        </h3>

                        <p>
                            <strong>📍 Endereço:</strong>
                            ${Catalogo.escapar(estabelecimento.endereco)}
                        </p>

                        <p>
                            <strong>📞 Telefone:</strong>
                            ${Catalogo.escapar(estabelecimento.telefone)}
                        </p>

                        <p>
                            <strong>🕒 Horário:</strong>
                            ${Catalogo.escapar(estabelecimento.horario)}
                        </p>

                        ${
                            estabelecimento.descricao
                                ? `
                                    <p class="descricao-mercadinho">
                                        ${Catalogo.escapar(estabelecimento.descricao)}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <button class="verProdutos">
                    Ver produtos
                </button>

            `;


            Catalogo.logo(div.querySelector(".icone-mercadinho"), estabelecimento);
            listaMercadinhos.appendChild(
                div
            );


            const botao =
                div.querySelector(
                    ".verProdutos"
                );


            botao.addEventListener(
                "click",
                function() {

                    localStorage.setItem(
                        "mercadinhoSelecionado",
                        estabelecimento.fornecedor_id
                    );


                    window.location.href =
                        "cliente.html";

                }
            );

        }
    );

}


// ==========================================
// INICIAR
// ==========================================

mostrarMercadinhos();