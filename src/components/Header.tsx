import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/api";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

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
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/home");
  };

  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Lado Esquerdo: Navegação */}
      <div className="flex gap-6 items-center">
        <h1
          className="text-xl font-bold text-purple-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Alugaí
        </h1>
        <button
          className="text-gray-700 hover:text-purple-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Início
        </button>
        <button
          className="text-gray-700 hover:text-purple-600 cursor-pointer"
          onClick={() => navigate("/places/create")}
        >
          Criar Espaço
        </button>
        <button
          className="text-gray-700 hover:text-purple-600 cursor-pointer"
          onClick={() => navigate("/rents")}
        >
          Minhas Locações
        </button>
        <button
          className="text-gray-700 hover:text-purple-600 cursor-pointer"
          onClick={() => navigate("/solicitacoes")}
        >
          Minhas Solicitações
        </button>
        <button
          className="text-gray-700 hover:text-purple-600 cursor-pointer"
          onClick={() => navigate("/meus-espacos")}
        >
          Meus espaços
        </button>
      </div>

      {/* Lado Direito: Usuário */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span
              className="text-sm text-gray-700 font-bold hover:text-purple-600 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              Olá, {user.name}
            </span>
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
              onClick={() => navigate("/login")}
              className="text-sm text-purple-600 hover:underline"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/registro")}
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
