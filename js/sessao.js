// O estado vem da sessão autenticada, inclusive ao trocar de aba.
(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const area = document.createElement("div");
    area.className = "estado-sessao";
    area.setAttribute("aria-live", "polite");
    (header.querySelector(".cabecalho-conteudo") || header).appendChild(area);
    let revisao = 0;

    function marcarPaginaAtual() {
        const pagina = window.location.pathname.split("/").pop() || "index.html";
        header.querySelectorAll("nav a").forEach(link => {
            const destino = link.getAttribute("href").split("/").pop();
            if (destino === pagina || (pagina === "cliente.html" && destino === "mercadinhos.html")) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }
    marcarPaginaAtual();

    function identidade(nome, tipo) {
        const grupo = document.createElement("div");
        grupo.className = "conta-identidade";
        const avatar = document.createElement("span");
        avatar.className = "conta-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase();
        const dados = document.createElement("div");
        dados.className = "conta-dados";
        const titulo = document.createElement("strong");
        titulo.className = "conta-nome";
        titulo.textContent = nome;
        const detalhe = document.createElement("span");
        detalhe.className = "conta-tipo";
        detalhe.textContent = tipo;
        dados.append(titulo, detalhe);
        grupo.append(avatar, dados);
        return grupo;
    }

    async function mostrar(usuario) {
        const atual = ++revisao;
        if (!usuario) {
            const visitante = document.createElement("span");
            visitante.className = "sessao-visitante";
            visitante.textContent = "Bem-vindo! Você está navegando como visitante.";
            area.replaceChildren(visitante);
            document.querySelectorAll('nav a[data-login-original]').forEach(link => {
                link.href = link.dataset.loginOriginal;
                link.textContent = link.dataset.textoOriginal;
            });
            marcarPaginaAtual();
            return;
        }
        const nome = usuario.user_metadata?.nome || usuario.user_metadata?.nome_responsavel || usuario.email || "Minha conta";
        area.replaceChildren(identidade(nome, "Conta conectada"));
        const { data: fornecedor } = await supabaseClient.from("fornecedores")
            .select("id, status").eq("id", usuario.id).maybeSingle();
        if (atual !== revisao) return;
        const ehFornecedor = fornecedor?.status === "Aprovado";
        const texto = identidade(nome, ehFornecedor ? "Fornecedor · Conectado" : "Conta conectada");
        const conta = document.createElement("a");
        conta.href = ehFornecedor ? "fornecedor.html" : "solicitacoes.html";
        conta.textContent = ehFornecedor ? "Meu painel" : "Minhas solicitações";
        const sair = document.createElement("button");
        sair.type = "button";
        sair.textContent = "Sair";
        sair.addEventListener("click", async () => {
            sair.disabled = true;
            const { error } = await supabaseClient.auth.signOut();
            if (error) { sair.disabled = false; alert("Não foi possível sair. Tente novamente."); return; }
            window.location.href = "index.html";
        });
        const acoes = document.createElement("div");
        acoes.className = "conta-acoes";
        acoes.append(conta, sair);
        area.replaceChildren(texto, acoes);
        document.querySelectorAll('nav a[href="cliente-login.html"], nav a[href="fornecedor-login.html"]').forEach(link => {
            link.dataset.loginOriginal = link.getAttribute("href");
            link.dataset.textoOriginal = link.textContent;
            link.href = conta.href;
            link.textContent = ehFornecedor ? "Meu painel" : "Minha conta";
        });
        marcarPaginaAtual();
    }
    supabaseClient.auth.onAuthStateChange((_evento, sessao) => {
        // A consulta ao perfil acontece fora do callback de autenticação.
        setTimeout(() => mostrar(sessao?.user), 0);
    });
})();
