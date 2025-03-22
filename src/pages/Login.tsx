import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login bem-sucedido:", response.data);

      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userEmail", email);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError(error.response?.data?.message || "Erro ao tentar fazer login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition">
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Ainda não tem uma conta?</p>
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition mt-2"
          >
            Registrar-se
          </button>
        </div>
      </div>
    </div>
  );
}
