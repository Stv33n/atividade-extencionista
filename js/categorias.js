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
            : '<div class="sem-imagem"><svg class="icone-interface" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10M7.5 4.5l9 5"/></svg> Produto sem imagem</div>';
        card.innerHTML = `${imagem}
            <h3>${Catalogo.escapar(produto.nome)}</h3>
            <p>${Catalogo.escapar(Catalogo.medida(produto))}</p>
            <p class="categoria-produto">${Catalogo.escapar(categoria)}</p>
            ${Catalogo.preco(produto)}
            <p>${Number(produto.estoque) > 0 ? "Disponível" : "Esgotado"}</p>`;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.disabled = !(Number(produto.estoque) > 0);
        botao.textContent = botao.disabled ? "Esgotado" : "Adicionar à lista";
        botao.addEventListener("click", () => adicionarAoCarrinho(indice));
        card.appendChild(botao);
        listaProdutosCliente.appendChild(card);
    });
    document.getElementById("resumoCategoria").textContent = quantidade + " produto(s) · " + categoriaSelecionada;
    if (!quantidade) listaProdutosCliente.innerHTML = "<p>Nenhum produto nesta categoria.</p>";
}
