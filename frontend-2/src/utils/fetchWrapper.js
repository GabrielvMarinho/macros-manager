export default async function fetchWrapper(promise, fallback = null){
    try {

        const res = await promise;
        if (res.error) {
            console.error("Erro: ", res.error);
            return fallback;
        }
        
        return JSON.parse(res);
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    return fallback;
  }
}