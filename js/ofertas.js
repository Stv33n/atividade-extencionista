const Ofertas = {
    normalizar(nome) {
        return String(nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
    },
    chave(produto) {
        // 1 kg e 1000 g são comparáveis; embalagens de 1 kg e 5 kg ficam separadas.
        const unidades = { kg: [1000, "g"], g: [1, "g"], l: [1000, "ml"], ml: [1, "ml"], un: [1, "un"] };
        const unidade = unidades[produto.unidade];
        const conteudo = Number(produto.conteudo);
        if (!unidade || !Number.isFinite(conteudo) || conteudo <= 0) return null;
        return JSON.stringify([this.normalizar(produto.nome), Number((conteudo * unidade[0]).toFixed(6)), unidade[1]]);
    },
    selecionar(produtos, mercados) {
        const porFornecedor = new Map(mercados.map(mercado => [String(mercado.fornecedor_id), mercado]));
        const melhores = new Map();
        for (const produto of produtos) {
            const mercado = porFornecedor.get(String(produto.fornecedor_id));
            const preco = Number(produto.preco);
            const anterior = Number(produto.preco_anterior);
            const chave = this.chave(produto);
            if (!mercado || !chave || !this.normalizar(produto.nome) || !produto.promocao ||
                !(Number(produto.estoque) > 0) || !Number.isFinite(preco) || preco < 0 ||
                !Number.isFinite(anterior) || anterior <= preco) continue;
            const atual = melhores.get(chave);
            if (!atual || preco < Number(atual.produto.preco)) melhores.set(chave, { produto, mercado });
        }
        return [...melhores.values()].sort((a, b) => a.produto.nome.localeCompare(b.produto.nome, "pt-BR") || Number(a.produto.preco) - Number(b.produto.preco));
    }
};

(() => {
    const lista = document.getElementById("listaOfertas");
    const estado = document.getElementById("estadoOfertas");
    const anterior = document.getElementById("ofertasAnterior");
    const proxima = document.getElementById("ofertasProxima");
    if (!lista) return;

    function atualizarSetas() {
        const maximo = lista.scrollWidth - lista.clientWidth;
        anterior.disabled = lista.scrollLeft <= 2;
        proxima.disabled = maximo <= 2 || lista.scrollLeft >= maximo - 2;
    }
    function deslizar(direcao) {
        lista.scrollBy({ left: direcao * (lista.firstElementChild?.getBoundingClientRect().width + 16 || 266),
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    anterior.addEventListener("click", () => deslizar(-1));
    proxima.addEventListener("click", () => deslizar(1));
    lista.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas);

    // Paginação evita escolher um preço apenas entre os primeiros registros da API.
    async function carregarTodos(tabela, campos, filtrar = consulta => consulta) {
        const registros = [];
        for (let inicio = 0; ; inicio += 500) {
            const { data, error } = await filtrar(supabaseClient.from(tabela).select(campos))
                .order("id", { ascending: true }).range(inicio, inicio + 499);
            if (error) throw error;
            registros.push(...(data || []));
            if (!data || data.length < 500) return registros;
        }
    }

    function criarCard({ produto, mercado }, imagens) {
        const item = document.createElement("div");
        item.className = "oferta-item";
        item.setAttribute("role", "listitem");
        const card = document.createElement("a");
        card.className = "oferta-card";
        card.href = "cliente.html?mercado=" + encodeURIComponent(produto.fornecedor_id);
        const url = Catalogo.urlImagem(Catalogo.imagemDoProduto(produto.nome, imagens));
        const desconto = Math.floor((1 - Number(produto.preco) / Number(produto.preco_anterior)) * 100);
        card.innerHTML = `<span class="oferta-selo">${desconto > 0 ? desconto + "% de desconto" : "Em promoção"}</span>
            <div class="oferta-sem-imagem">Imagem não disponível</div>
            ${url.startsWith("img/produtos/") ? '<small class="imagem-ilustrativa">Imagem ilustrativa</small>' : ''}
            <h3>${Catalogo.escapar(produto.nome)}</h3>
            <p class="oferta-medida">${Catalogo.escapar(Catalogo.medida(produto))}</p>
            <p class="oferta-anterior">De <del>${Catalogo.moeda(produto.preco_anterior)}</del></p>
            <strong class="oferta-preco">${Catalogo.moeda(produto.preco)}</strong>
            <div class="oferta-mercado"><span class="icone-mercadinho"></span><span>${Catalogo.escapar(mercado.nome_fantasia)}</span></div>
            <span class="oferta-destino">Ver produtos deste mercado →</span>`;
        Catalogo.logo(card.querySelector(".icone-mercadinho"), mercado);
        if (url) {
            const fallback = card.querySelector(".oferta-sem-imagem");
            const imagem = document.createElement("img");
            imagem.className = "oferta-imagem";
            imagem.src = url;
            imagem.alt = produto.nome;
            imagem.loading = "lazy";
            imagem.addEventListener("error", () => imagem.replaceWith(fallback));
            fallback.replaceWith(imagem);
        }
        item.appendChild(card);
        return item;
    }

    async function carregar() {
        try {
            const [produtos, mercados, resultadoImagens] = await Promise.all([
                carregarTodos("produtos", "id, nome, preco, preco_anterior, promocao, estoque, conteudo, unidade, fornecedor_id", consulta => consulta.eq("promocao", true).gt("estoque", 0)),
                carregarTodos("estabelecimentos", "id, fornecedor_id, nome_fantasia, logo_url"),
                supabaseClient.from("imagens_produtos").select("nome_produto, imagem_url")
                    .then(resultado => resultado, () => ({ data: [] }))
            ]);
            const ofertas = Ofertas.selecionar(produtos, mercados);
            const imagens = (resultadoImagens.data || []).filter(imagem => Ofertas.normalizar(imagem.nome_produto))
                .sort((a, b) => b.nome_produto.length - a.nome_produto.length);
            lista.replaceChildren(...ofertas.map(oferta => criarCard(oferta, imagens)));
            estado.textContent = ofertas.length ? "" : "Nenhuma oferta disponível no momento. Confira os produtos nos mercadinhos.";
            estado.hidden = ofertas.length > 0;
            atualizarSetas();
        } catch (erro) {
            estado.textContent = "Não foi possível carregar as ofertas. Atualize a página para tentar novamente.";
            console.error("Erro ao carregar ofertas:", erro);
        }
    }
    carregar();
})();
