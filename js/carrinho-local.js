// Cada conta mantém sua própria lista; visitantes usam uma lista separada.
const CarrinhoLocal = (() => {
    let usuario;
    let chave;
    let revisao = 0;
    const chaveVisitante = "mercadinho:carrinho:visitante";
    function lerChave(nome) {
        try {
            const dados = JSON.parse(localStorage.getItem(nome) || "[]");
            return Array.isArray(dados) ? dados.filter(item => item && typeof item === "object" &&
                item.id && item.fornecedor_id && Number.isInteger(Number(item.quantidade)) && Number(item.quantidade) > 0) : [];
        } catch { return []; }
    }
    function sincronizar(sessao) {
        const proximo = sessao?.user?.id || null;
        if (usuario === proximo) return;
        const anterior = usuario;
        const novaChave = proximo ? "mercadinho:carrinho:conta:" + proximo : chaveVisitante;
        // Leva a seleção do visitante para a conta ao entrar, se ela ainda não tiver uma lista.
        if (anterior === null && proximo && !lerChave(novaChave).length) {
            const visitante = lerChave(chaveVisitante);
            if (visitante.length) {
                localStorage.setItem(novaChave, JSON.stringify(visitante));
                localStorage.removeItem(chaveVisitante);
            }
        }
        usuario = proximo;
        chave = novaChave;
        if (anterior !== undefined) window.dispatchEvent(new Event("conta-carrinho-alterada"));
    }
    supabaseClient.auth.onAuthStateChange((_evento, sessao) => {
        revisao++;
        sincronizar(sessao);
    });
    const versaoInicial = revisao;
    const pronto = supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (revisao === versaoInicial) sincronizar(data.session);
    });
    return {
        pronto,
        get usuario() { return usuario; },
        async ler() { await pronto; return lerChave(chave); },
        salvar(itens) {
            if (!chave) throw new Error("Aguarde o carregamento da sua lista.");
            localStorage.setItem(chave, JSON.stringify(itens));
        }
    };
})();
