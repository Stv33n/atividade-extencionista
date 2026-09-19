const formLogin =
    document.getElementById("formLogin");

const formCadastro =
    document.getElementById("formCadastro");


// ==========================================
// CADASTRAR FORNECEDOR
// ==========================================

formCadastro.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const razaoSocial =
            document.getElementById("razaoSocial").value;

        const cnpj =
            document.getElementById("cnpj").value;

        const nome =
            document.getElementById("nomeFornecedor").value;

        const email =
            document.getElementById("emailCadastro").value;

        const senha =
            document.getElementById("senhaCadastro").value;


        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: senha,

                options: {

                    data: {
                        
                        tipo: "fornecedor",

                        razao_social: razaoSocial,

                        cnpj: cnpj,

                        nome_responsavel: nome

                    }

                }

            });


        if (error) {

            alert(
                "Erro ao cadastrar: " +
                error.message
            );

            return;
        }


        alert(
            "Cadastro enviado com sucesso!\n\n" +
            "Aguarde a aprovação do administrador."
        );


        formCadastro.reset();

    }
);


// ==========================================
// LOGIN DO FORNECEDOR
// ==========================================

formLogin.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const senha =
            document.getElementById("senha").value;


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
            data: fornecedor,
            error: erroFornecedor
        } =
            await supabaseClient
                .from("fornecedores")
                .select("*")
                .eq("id", usuario.id)
                .single();


        if (erroFornecedor) {

            alert(
                "Não foi possível encontrar os dados do fornecedor."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        if (fornecedor.status === "Pendente") {

            alert(
                "Seu cadastro ainda está aguardando aprovação."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        if (fornecedor.status === "Recusado") {

            alert(
                "Seu cadastro não foi aprovado."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        alert(
            "Login realizado com sucesso!"
        );


        window.location.href =
            "fornecedor.html";

    }
);