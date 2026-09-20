// Apresentação compartilhada do catálogo e do carrinho.
const Catalogo = {
    imagensExtras: [
        ["Carne moída", "carne-moida"], ["Bife", "bife"], ["Costela", "costela"],
        ["Peito de frango", "peito-de-frango"], ["Linguiça", "linguica"],
        ["Detergente", "detergente"], ["Água sanitária", "agua-sanitaria"],
        ["Desinfetante", "desinfetante"], ["Sabão em pó", "sabao-em-po"], ["Amaciante", "amaciante"]
    ].map(([nome_produto, arquivo]) => ({ nome_produto, imagem_url: "img/produtos/" + arquivo + ".png" })),
    normalizarNome(nome) {
        return String(nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    },
    mesclarImagens(imagens = []) {
        const catalogo = new Map(this.imagensExtras.map(item => [this.normalizarNome(item.nome_produto), item]));
        for (const item of imagens) {
            if (this.normalizarNome(item.nome_produto) && this.urlImagem(item.imagem_url)) {
                catalogo.set(this.normalizarNome(item.nome_produto), item);
            }
        }
        return [...catalogo.values()];
    },
    imagemDoProduto(nome, imagens) {
        const nomeNormalizado = " " + this.normalizarNome(nome) + " ";
        const candidatos = this.mesclarImagens(imagens).sort((a, b) =>
            this.normalizarNome(b.nome_produto).length - this.normalizarNome(a.nome_produto).length);
        return candidatos.find(item => nomeNormalizado.includes(" " + this.normalizarNome(item.nome_produto) + " "))?.imagem_url || null;
    },
    categorias: ["Frutas", "Legumes", "Cereais", "Limpeza", "Carnes", "Outros"],
    escapar(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[c]);
    },
    moeda(valor) {
        return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },
    medida(produto) {
        if (!(Number(produto.conteudo) > 0) || !produto.unidade) return "Conteúdo não informado";
        return Number(produto.conteudo).toLocaleString("pt-BR") + " " +
            ({ un: "unidade(s)", kg: "kg", g: "g", l: "L", ml: "mL" }[produto.unidade] || "");
    },
    preco(produto) {
        const atual = this.moeda(produto.preco);
        if (produto.promocao && Number(produto.preco_anterior) > Number(produto.preco)) {
            return `<p class="preco-produto"><span class="selo-promocao">Promoção</span> De <del>${this.moeda(produto.preco_anterior)}</del> por <strong>${atual}</strong></p>`;
        }
        return `<p class="preco-produto">Preço: <strong>${atual}</strong></p>`;
    },
    urlImagem(valor) {
        if (typeof valor === "string" && /^img\/produtos\/[a-z0-9-]+\.png$/.test(valor)) return valor;
        try {
            const url = new URL(valor);
            return url.protocol === "https:" ? url.href : "";
        } catch { return ""; }
    },
    logo(elemento, estabelecimento) {
        const nome = estabelecimento.nome_fantasia || "Mercadinho";
        const iniciais = nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
        elemento.textContent = iniciais;
        elemento.setAttribute("aria-label", nome);
        const url = this.urlImagem(estabelecimento.logo_url);
        if (!url) return;
        const imagem = document.createElement("img");
        imagem.src = url;
        imagem.alt = "Logo de " + nome;
        imagem.className = "logo-mercadinho";
        imagem.addEventListener("error", () => { elemento.textContent = iniciais; });
        elemento.replaceChildren(imagem);
    }
};
