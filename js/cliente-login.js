const formLoginCliente =
    document.getElementById("formLoginCliente");

const formCadastroCliente =
    document.getElementById("formCadastroCliente");


// ==========================================
// CADASTRAR CLIENTE
// ==========================================

formCadastroCliente.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const nome =
            document.getElementById(
                "nomeCliente"
            ).value;

        const email =
            document.getElementById(
                "emailCadastroCliente"
            ).value;

        const senha =
            document.getElementById(
                "senhaCadastroCliente"
            ).value;


        const { error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: senha,

                options: {

                    data: {

                        tipo: "cliente",

                        nome: nome

                    }

                }

            });


        if (error) {

            alert(
                "Erro ao criar conta:\n" +
                error.message
            );

            return;
        }


        alert(
            "Conta criada com sucesso!"
        );


        formCadastroCliente.reset();

    }
);


// ==========================================
// LOGIN DO CLIENTE
// ==========================================

formLoginCliente.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "emailCliente"
            ).value;

        const senha =
            document.getElementById(
                "senhaCliente"
            ).value;


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


        if (
            usuario.user_metadata.tipo !==
            "cliente"
        ) {

            alert(
                "Esta conta não é de cliente."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        alert(
            "Login realizado com sucesso!"
        );


        const paginaDepoisLogin =
            localStorage.getItem(
                "paginaDepoisLogin"
            );


        if (paginaDepoisLogin) {

            localStorage.removeItem(
                "paginaDepoisLogin"
            );

            window.location.href =
                paginaDepoisLogin;

        }
        else {

            window.location.href =
                "mercadinhos.html";

        }

    }
);