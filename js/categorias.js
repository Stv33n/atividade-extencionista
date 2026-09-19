let categoriaSelecionada = "Todos";

function criarCategorias() {
    const area = document.getElementById("categoriasProdutos");
    area.replaceChildren();
    ["Todos", ...Catalogo.categorias].forEach(categoria => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = categoria;
        botao.dataset.categoria = categoria;
        botao.setAttribute("aria-controls", "listaProdutosCliente");
        botao.addEventListener("click", () => {
            categoriaSelecionada = categoria;
            renderizarProdutos();
        });
        area.appendChild(botao);
    });
}

function renderizarProdutos() {
    listaProdutosCliente.replaceChildren();
    let quantidade = 0;
    document.querySelectorAll("#categoriasProdutos button").forEach(botao => {
        botao.setAttribute("aria-pressed", String(botao.dataset.categoria === categoriaSelecionada));
    });
    produtos.forEach((produto, indice) => {
        const categoria = Catalogo.categorias.includes(produto.categoria) ? produto.categoria : "Outros";
        if (categoriaSelecionada !== "Todos" && categoria !== categoriaSelecionada) return;
        quantidade++;
        const card = document.createElement("div");
        card.className = "produto";
        const imagemUrl = Catalogo.urlImagem(encontrarImagem(produto.nome));
        const imagem = imagemUrl
            ? `<img src="${Catalogo.escapar(imagemUrl)}" alt="${Catalogo.escapar(produto.nome)}" class="imagem-produto" loading="lazy">`
            : '<div class="sem-imagem">📦 Produto sem imagem</div>';
        card.innerHTML = `${imagem}
            <h3>${Catalogo.escapar(produto.nome)}</h3>
            <p>${Catalogo.escapar(Catalogo.medida(produto))}</p>
            <p class="categoria-produto">${Catalogo.escapar(categoria)}</p>
            ${Catalogo.preco(produto)}
            <p>Estoque: ${Number(produto.estoque)} embalagem(ns)/porção(ões)</p>`;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.disabled = !(Number(produto.estoque) > 0);
        botao.textContent = botao.disabled ? "Esgotado" : "🛒 Adicionar à lista";
        botao.addEventListener("click", () => adicionarAoCarrinho(indice));
        card.appendChild(botao);
        listaProdutosCliente.appendChild(card);
    });
    document.getElementById("resumoCategoria").textContent = quantidade + " produto(s) · " + categoriaSelecionada;
    if (!quantidade) listaProdutosCliente.innerHTML = "<p>Nenhum produto nesta categoria.</p>";
}
