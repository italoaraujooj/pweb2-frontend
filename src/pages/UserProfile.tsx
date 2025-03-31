import { useEffect, useState } from "react";
import { AuthService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const UserProfile = () => {
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
      console.error("Erro ao carregar perfil:", err);
      setError("Erro ao carregar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  if (loading) return <p className="text-center">Carregando perfil...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <h1 className="text-3xl font-bold text-black text-center mb-6 py-6 px-4">Meu Perfil</h1>

      <div className="bg-white shadow rounded p-6 max-w-xl mx-auto">
        <div className="space-y-2 text-gray-700">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefone:</strong> {user.phone}</p>
          <p><strong>Profissão:</strong> {user.profession}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate("/editar-perfil")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Editar Perfil
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Desconectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;