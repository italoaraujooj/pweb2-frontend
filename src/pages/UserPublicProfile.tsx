import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserService } from "../services/api";
import Header from "../components/Header";

const UserPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await UserService.getUserById(id!);
      setUser(response.data);
    } catch (err: any) {
      setError("Erro ao carregar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center">Carregando perfil...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Header />
      <h1 className="text-3xl font-bold text-black text-center mb-6 py-6 px-4">
        Perfil de {user.name}
      </h1>

      <div className="bg-white shadow rounded p-6 max-w-xl mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={user.profileImage}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-avatar.png";
            }}
            alt="Foto de Perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
          />
        </div>

        <div className="space-y-2 text-gray-700 text-center">
          <p>
            <strong>Avaliação:</strong> {user.averageRating}
          </p>
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
      </div>
    </div>
  );
};

export default UserPublicProfile;