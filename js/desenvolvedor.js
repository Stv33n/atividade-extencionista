const formAdmin =
    document.getElementById("formAdmin");

const loginDesenvolvedor =
    document.getElementById("loginDesenvolvedor");

const areaAdmin =
    document.getElementById("areaAdmin");

const listaFornecedores =
    document.getElementById("listaFornecedores");

const listaClientes =
    document.getElementById("listaClientes");

const botaoSair =
    document.getElementById("sairAdmin");


// ==========================================
// LOGIN DO ADMIN
// ==========================================

formAdmin.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("emailAdmin").value;

        const senha =
            document.getElementById("senhaAdmin").value;


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: senha

            });


        if (error) {

            alert(
                "E-mail ou senha incorretos."
            );

            return;
        }


        const usuario =
            data.user;


        const {
            data: administrador,
            error: erroAdmin
        } =
            await supabaseClient
                .from("administradores")
                .select("*")
                .eq(
                    "id",
                    usuario.id
                )
                .single();


        if (
            erroAdmin ||
            !administrador
        ) {

            alert(
                "Esta conta não possui acesso de administrador."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        loginDesenvolvedor.style.display =
            "none";

        areaAdmin.style.display =
            "block";


        mostrarFornecedores();

        mostrarClientes();

    }
);


// ==========================================
// MOSTRAR FORNECEDORES
// ==========================================

async function mostrarFornecedores() {

    listaFornecedores.innerHTML =
        "<p>Carregando fornecedores...</p>";


    const {
        data: fornecedores,
        error
    } =
        await supabaseClient
            .from("fornecedores")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        listaFornecedores.innerHTML =
            "<p>Erro ao carregar fornecedores.</p>";

        console.log(error);

        return;
    }


    listaFornecedores.innerHTML = "";


    if (
        !fornecedores ||
        fornecedores.length === 0
    ) {

        listaFornecedores.innerHTML =
            "<p>Nenhum fornecedor cadastrado.</p>";

        return;
    }


    fornecedores.forEach(
        function(fornecedor) {

            const div =
                document.createElement("div");


            div.className =
                "produto";


            div.innerHTML =

                "<h3>" +
                Catalogo.escapar(fornecedor.razao_social) +
                "</h3>" +

                "<p>CNPJ: " +
                Catalogo.escapar(fornecedor.cnpj) +
                "</p>" +

                "<p>Responsável: " +
                Catalogo.escapar(fornecedor.nome_responsavel) +
                "</p>" +

                "<p>E-mail: " +
                Catalogo.escapar(fornecedor.email) +
                "</p>" +

                "<p>Status: <strong>" +
                Catalogo.escapar(fornecedor.status) +
                "</strong></p>" +

                "<div class='acoes-card' role='group' aria-label='Ações do fornecedor'>" +
                "<button type='button' class='aprovar'>" +
                "Aprovar" +
                "</button>" +

                "<button type='button' class='recusar botao-alerta'>" +
                "Recusar" +
                "</button>" +

                "<button type='button' class='excluir botao-perigo'>" +
                "Excluir" +
                "</button></div>";


            listaFornecedores.appendChild(
                div
            );


            const botaoAprovar =
                div.querySelector(".aprovar");

            const botaoRecusar =
                div.querySelector(".recusar");

            const botaoExcluir =
                div.querySelector(".excluir");


            botaoAprovar.addEventListener(
                "click",
                function() {

                    alterarStatus(
                        fornecedor.id,
                        "Aprovado"
                    );

                }
            );


            botaoRecusar.addEventListener(
                "click",
                function() {

                    alterarStatus(
                        fornecedor.id,
                        "Recusado"
                    );

                }
            );


            botaoExcluir.addEventListener(
                "click",
                function() {

                    excluirFornecedor(
                        fornecedor.id
                    );

                }
            );

        }
    );

}


// ==========================================
// MOSTRAR CLIENTES
// ==========================================

async function mostrarClientes() {

    listaClientes.innerHTML =
        "<p>Carregando clientes...</p>";


    const {
        data: clientes,
        error
    } =
        await supabaseClient
            .from("clientes")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        listaClientes.innerHTML =
            "<p>Erro ao carregar clientes.</p>";

        console.log(error);

        return;
    }


    listaClientes.innerHTML = "";


    if (
        !clientes ||
        clientes.length === 0
    ) {

        listaClientes.innerHTML =
            "<p>Nenhum cliente cadastrado.</p>";

        return;
    }


    clientes.forEach(
        function(cliente) {

            const div =
                document.createElement("div");


            div.className =
                "produto";


            div.innerHTML =

                "<h3>" +
                Catalogo.escapar(cliente.nome) +
                "</h3>" +

                "<p>E-mail: " +
                Catalogo.escapar(cliente.email) +
                "</p>" +

                "<p>Data do cadastro: " +
                new Date(
                    cliente.created_at
                ).toLocaleString(
                    "pt-BR"
                ) +
                "</p>";


            listaClientes.appendChild(
                div
            );

        }
    );

}


// ==========================================
// ALTERAR STATUS DO FORNECEDOR
// ==========================================

async function alterarStatus(
    id,
    novoStatus
) {

    const { error } =
        await supabaseClient
            .from("fornecedores")
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
            "Erro ao alterar status."
        );

        console.log(error);

        return;
    }


    alert(
        "Status alterado com sucesso!"
    );


    mostrarFornecedores();

}


// ==========================================
// EXCLUIR FORNECEDOR
// ==========================================

async function excluirFornecedor(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este fornecedor?"
        );


    if (!confirmar) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("fornecedores")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Erro ao excluir fornecedor."
        );

        console.log(error);

        return;
    }


    alert(
        "Fornecedor excluído da lista!"
    );


    mostrarFornecedores();

}


// ==========================================
// SAIR
// ==========================================

botaoSair.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();


        areaAdmin.style.display =
            "none";

        loginDesenvolvedor.style.display =
            "block";


        formAdmin.reset();

    }
);
