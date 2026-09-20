// Apresentação compartilhada do catálogo e do carrinho.
const Catalogo = {
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
