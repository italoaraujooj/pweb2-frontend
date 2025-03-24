import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/api";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await AuthService.getUser();
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Lado Esquerdo: Navegação */}
      <div className="flex gap-6 items-center">
        <h1
          className="text-xl font-bold text-purple-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          AlugSpace
        </h1>
        <button
          className="text-gray-700 hover:text-purple-600"
          onClick={() => navigate("/places/create")}
        >
          Criar Espaço
        </button>
        <button
          className="text-gray-700 hover:text-purple-600"
          onClick={() => navigate("/minhas-locacoes")}
        >
          Minhas Locações
        </button>
      </div>

      {/* Lado Direito: Usuário */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-700">Olá, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-purple-600 hover:underline"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-purple-600 hover:underline"
            >
              Registrar
            </button>
          </>
        )}
      </div>
    </header>
  );
}
