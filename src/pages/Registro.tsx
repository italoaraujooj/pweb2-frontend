import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        profession,
      });
      setSuccess("Usuário cadastrado com sucesso!");

      setTimeout(() => navigate("/"), 2000); // Redireciona para login após 2s
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      setError(error.response?.data?.message || "Erro ao tentar registrar.");
    }
  };

  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, ""); // Remove tudo que não for número
    value = value.substring(0, 11); // Limita a 11 dígitos

    if (value.length <= 10) {
      // Formato para telefones fixos: (99) 9999-9999
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else {
      // Formato para celulares: (99) 99999-9999
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    }

    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gray-100">
      <h1
        onClick={() => navigate("/")}
        className="absolute top-4 left-6 text-purple-600 text-2xl font-bold hover:cursor-pointer"
      >
        Alugaí
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Criar Conta
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm text-center mt-2">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-600">Nome</label>
            <input
              type="text"
              className="w-full p-2 border rounded mt-1 text-gray-900"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">E-mail</label>
            <input
              type="email"
              className="w-full p-2 border rounded mt-1 text-gray-900"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Senha</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1 text-gray-900"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Telefone</label>
            <input
              type="tel"
              className="w-full p-2 border rounded mt-1 text-gray-900"
              placeholder="Digite seu telefone"
              value={phone}
              onChange={handlePhoneChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Profissão</label>
            <input
              type="text"
              className="w-full p-2 border rounded mt-1 text-gray-900"
              placeholder="Digite sua profissão"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-black text-white p-2 rounded hover:bg-purple-600 transition">
            Cadastrar
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">Já tem uma conta?</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-black text-white p-2 rounded hover:bg-purple-600 transition mt-2"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
