const FotoEstabelecimento = (() => {
    const campo = document.getElementById("fotoEstabelecimento");
    const link = document.getElementById("logoUrl");
    const tipos = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    let previaUrl = null;

    function validar(arquivo) {
        if (!Object.hasOwn(tipos, arquivo.type)) throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
        if (!arquivo.size || arquivo.size > 5 * 1024 * 1024) throw new Error("Escolha uma imagem de até 5 MB que não esteja vazia.");
    }

    function limparPrevia() {
        if (previaUrl) URL.revokeObjectURL(previaUrl);
        previaUrl = null;
    }

    function mostrarPrevia() {
        limparPrevia();
        const arquivo = campo.files[0];
        if (!arquivo) return false;
        previaUrl = URL.createObjectURL(arquivo);
        const imagem = document.createElement("img");
        imagem.className = "logo-mercadinho";
        imagem.alt = "Prévia da foto selecionada";
        imagem.src = previaUrl;
        document.getElementById("previaLogo").replaceChildren(imagem);
        return true;
    }

    campo.addEventListener("change", () => {
        try {
            if (campo.files[0]) validar(campo.files[0]);
        } catch (erro) {
            campo.value = "";
            alert(erro.message);
        }
        // O arquivo tem prioridade sobre um link salvo anteriormente.
        link.disabled = Boolean(campo.files[0]);
        atualizarPreviaLogo();
    });
    window.addEventListener("pagehide", limparPrevia);

    async function enviar(usuarioId) {
        const arquivo = campo.files[0];
        if (!arquivo) return link.value.trim();
        validar(arquivo);
        const caminho = usuarioId + "/" + crypto.randomUUID() + "." + tipos[arquivo.type];
        campo.disabled = true;
        try {
            const storage = supabaseClient.storage.from("fotos-estabelecimentos");
            const { error } = await storage.upload(caminho, arquivo, {
                contentType: arquivo.type,
                upsert: false
            });
            if (error) throw new Error("Não foi possível enviar a foto. Tente novamente; se persistir, avise o responsável pelo site.");
            const { data } = storage.getPublicUrl(caminho);
            link.value = data.publicUrl;
            campo.value = "";
            link.disabled = false;
            limparPrevia();
            atualizarPreviaLogo();
            return data.publicUrl;
        } finally {
            campo.disabled = false;
        }
    }
    return { mostrarPrevia, enviar, validar };
})();
