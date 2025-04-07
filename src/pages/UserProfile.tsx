import { useEffect, useRef, useState } from "react";
import { AuthService, UserService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FiUpload } from "react-icons/fi";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    navigate("/");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user?.id) return;

    const file = e.target.files[0];
    try {
      await UserService.updateProfileImage(user.id, file);
      fetchUser();
    } catch (err) {
      console.error("Erro ao atualizar imagem:", err);
    }
  };

  if (loading) return <p className="text-center">Carregando perfil...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <h1 className="text-3xl font-bold text-black text-center mb-6 py-6 px-4">
        Meu Perfil
      </h1>

      <div className="bg-white shadow rounded p-6 max-w-xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative group w-32 h-32">
            <img
              src={user.profileImage || "../assets/default-avatar.png"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/default-avatar.png";
              }}
              alt="Foto de Perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
            />

            {/* Botão de upload que só aparece no hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center group-hover:transition"
            >
              <div className="w-8 h-8 bg-black bg-opacity-70 rounded-full flex items-center cursor-pointer justify-center opacity-0 group-hover:opacity-100 transition">
                <FiUpload className="text-white text-lg" />
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2 text-gray-700 text-center">
          <p>
            <strong>Nome:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Telefone:</strong> {user.phone}
          </p>
          <p>
            <strong>Profissão:</strong> {user.profession}
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => navigate(`/user/edit/${user.id}`)}
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
