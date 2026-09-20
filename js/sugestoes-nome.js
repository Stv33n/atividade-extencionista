// Sugere nomes do catálogo sem alterar o texto até o fornecedor escolher.
const SugestoesNome = {
    normalizar(valor) {
        return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    },
    distancia(a, b) {
        const linhas = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= b.length; j++) linhas[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                linhas[i][j] = Math.min(linhas[i - 1][j] + 1, linhas[i][j - 1] + 1,
                    linhas[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    linhas[i][j] = Math.min(linhas[i][j], linhas[i - 2][j - 2] + 1);
                }
            }
        }
        return linhas[a.length][b.length];
    },
    buscar(texto, catalogo) {
        const consulta = this.normalizar(texto);
        if (consulta.length < 2 || consulta.length > 80) return [];
        const termos = consulta.split(" ");
        const nomes = [...new Set(catalogo.map(item => item.nome_produto).filter(nome =>
            typeof nome === "string" && this.normalizar(nome) && nome.length <= 120))];
        return nomes.map(nome => {
            const normalizado = this.normalizar(nome);
            if (normalizado === consulta) return { nome, pontos: 0 };
            if (normalizado.startsWith(consulta)) return { nome, pontos: 1 };
            const palavras = normalizado.split(" ");
            let pontos = 2;
            const usadas = new Set();
            for (const termo of termos) {
                let melhor = Infinity;
                let indice = -1;
                palavras.forEach((palavra, i) => {
                    if (usadas.has(i)) return;
                    const limite = termo.length < 3 ? 0 : termo.length <= 5 ? 1 : 2;
                    const distancia = palavra.startsWith(termo) ? 0 : this.distancia(termo, palavra);
                    if (distancia <= limite && distancia < melhor) { melhor = distancia; indice = i; }
                });
                if (indice === -1) return { nome, pontos: Infinity };
                usadas.add(indice);
                pontos += melhor;
            }
            return { nome, pontos };
        }).filter(item => Number.isFinite(item.pontos))
            .sort((a, b) => a.pontos - b.pontos || a.nome.length - b.nome.length || a.nome.localeCompare(b.nome, "pt-BR"))
            .slice(0, 5).map(item => item.nome);
    }
};
