import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await AuthService.login({ email, password });

      console.log("Login bem-sucedido:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", response.data.user.id); // 👈 se você quiser usar depois

      navigate("/home");
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401) {
          setError("E-mail ou senha inválidos. Verifique seus dados.");
        } else if (status === 404) {
          setError("Usuário não encontrado.");
        } else {
          setError(message || "Erro ao tentar fazer login.");
        }
      } else {
        setError("Erro de conexão. Verifique sua internet ou tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {error && (
          <div className="flex items-center justify-center text-red-500 text-sm mb-4">
            ⚠️ <span className="ml-2">{error}</span>
          </div>
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

          <button className="w-full bg-black text-white p-2 rounded hover:bg-purple-600 transition">
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Ainda não tem uma conta?</p>
          <button
            onClick={() => navigate("/registro")}
            className="w-full bg-black text-white p-2 rounded hover:bg-purple-600 transition mt-2"
          >
            Registrar-se
          </button>
        </div>
      </div>
    </div>
  );
}
