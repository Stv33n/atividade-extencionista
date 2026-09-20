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
                        <svg class="icone-interface" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 10v10h18V10M2 6l2-3h16l2 3v4a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0V6Z"/><path d="M2 6h20M9 20v-6h6v6"/></svg>
                    </div>

                    <div class="info-mercadinho">

                        <h3>
                            ${Catalogo.escapar(estabelecimento.nome_fantasia)}
                        </h3>

                        <p>
                            <strong><svg class="icone-interface" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Endereço:</strong>
                            ${Catalogo.escapar(estabelecimento.endereco)}
                        </p>

                        <p>
                            <strong><svg class="icone-interface" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 3 4 4-2 3a16 16 0 0 0 7 7l3-2 4 4-2 3C10 22 2 14 2 5l3-2Z"/></svg> Telefone:</strong>
                            ${Catalogo.escapar(estabelecimento.telefone)}
                        </p>

                        <p>
                            <strong><svg class="icone-interface" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg> Horário:</strong>
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