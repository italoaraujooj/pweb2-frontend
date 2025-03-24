import axios from "axios";

export async function buscarEnderecoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, "");
  const response = await axios.get(
    `https://viacep.com.br/ws/${cepLimpo}/json/`
  );

  if (response.data.erro) {
    throw new Error("CEP não encontrado");
  }

  return response.data;
}
