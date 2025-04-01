import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { AuthService } from "../services/api";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await AuthService.getUser();
      setUser(response.data);
    } catch (err: any) {
      setError("Erro ao carregar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/home");
  };

  if (loading) return <p className="text-center">Carregando perfil...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <header className="w-full bg-white rounded-full shadow-md py-4 px-6 flex items-center justify-between">
      {/* Lado Esquerdo: Navegação */}
      <div className="flex gap-6 items-center">
        <h1
          className="text-xl px-6 font-bold text-purple-600 cursor-pointer"
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
      <div className="flex items-center">
        {user ? (
          <>
            <div
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center cursor-pointer"
            >
              <img
                src={user.profileImage}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
              />
              <span className="text-xs text-gray-700 font-bold hover:text-purple-600 mt-1">
                {user.name}
              </span>
            </div>
            <button
              onClick={() => {
                const confirmLogout = window.confirm(
                  "Deseja realmente sair da conta?"
                );
                if (confirmLogout) handleLogout();
              }}
              className="text-red-500 cursor-pointer hover:text-red-900"
              title="Sair"
            >
              <FiLogOut size={16} />
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
