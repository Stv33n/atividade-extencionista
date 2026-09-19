const SUPABASE_URL =
    "https://upjpnfiedbxiorwgdude.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6uNunT1QU7a_BKGnP90tXg_fBZyd6JV";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function testarSupabase() {

    const { data, error } =
        await supabaseClient
            .from("fornecedores")
            .select("*");

    if (error) {

        console.log("Erro no Supabase:", error);

    } else {

        console.log("Supabase conectado!");
        console.log(data);

    }
}

testarSupabase();