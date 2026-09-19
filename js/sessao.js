// O estado vem da sessão autenticada, inclusive ao trocar de aba.
(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const area = document.createElement("div");
    area.className = "estado-sessao";
    area.setAttribute("aria-live", "polite");
    header.appendChild(area);
    let revisao = 0;

    async function mostrar(usuario) {
        const atual = ++revisao;
        if (!usuario) {
            area.textContent = "Você está navegando como visitante";
            document.querySelectorAll('nav a[data-login-original]').forEach(link => {
                link.href = link.dataset.loginOriginal;
                link.textContent = link.dataset.textoOriginal;
            });
            return;
        }
        area.textContent = "Conectado como " + (usuario.user_metadata?.nome || usuario.user_metadata?.nome_responsavel || usuario.email);
        const { data: fornecedor } = await supabaseClient.from("fornecedores")
            .select("id, status").eq("id", usuario.id).maybeSingle();
        if (atual !== revisao) return;
        const ehFornecedor = fornecedor?.status === "Aprovado";
        const texto = document.createElement("span");
        texto.textContent = area.textContent + (ehFornecedor ? " · Fornecedor" : " · Cliente");
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
        area.replaceChildren(texto, conta, sair);
        document.querySelectorAll('nav a[href="cliente-login.html"], nav a[href="fornecedor-login.html"]').forEach(link => {
            link.dataset.loginOriginal = link.getAttribute("href");
            link.dataset.textoOriginal = link.textContent;
            link.href = conta.href;
            link.textContent = ehFornecedor ? "Meu painel" : "Minha conta";
        });
    }
    supabaseClient.auth.onAuthStateChange((_evento, sessao) => {
        // A consulta ao perfil acontece fora do callback de autenticação.
        setTimeout(() => mostrar(sessao?.user), 0);
    });
})();
