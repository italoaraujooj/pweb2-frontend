import { useEffect, useState } from "react";
import { AuthService, UserService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function EditUserProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await AuthService.getUser();
      setFormData(response.data);
    } catch {
      setError("Erro ao carregar perfil do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in passwordData) {
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordData.currentPassword) {
      setError(
        "Você precisa informar a senha atual para salvar as alterações."
      );
      return;
    }

    if (passwordData.newPassword || passwordData.confirmPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("A nova senha e a confirmação não coincidem.");
        return;
      }
    }

    try {
      const user = await AuthService.getUser();

      const updatePayload: any = {
        ...formData,
        currentPassword: passwordData.currentPassword,
      };

      if (passwordData.newPassword && passwordData.confirmPassword) {
        updatePayload.newPassword = passwordData.newPassword;
      }

      await UserService.updateUser(user.data.id, updatePayload);
      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch {
      setError("Erro ao atualizar o perfil. Verifique a senha atual.");
    }
  };

  if (loading) return <p className="text-center">Carregando perfil...</p>;

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <div className="flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-black text-center">
            Editar Perfil
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-600 text-center mb-4">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full p-2 border rounded text-black"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded text-black"
              required
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Telefone"
              className="w-full p-2 border rounded text-black"
            />
            <input
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Profissão"
              className="w-full p-2 border rounded text-black"
            />

            <hr className="my-4" />

            <h2 className="text-lg font-semibold text-black">Alterar Senha</h2>

            <input
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handleChange}
              placeholder="Senha atual (obrigatória)"
              className="w-full p-2 border rounded text-black"
              required
            />

            <input
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handleChange}
              placeholder="Nova senha (opcional)"
              className="w-full p-2 border rounded text-black"
            />

            <input
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme a nova senha"
              className="w-full p-2 border rounded text-black"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}