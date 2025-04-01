import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlaceService } from "../services/api";
import AvailabilitySelector from "../components/AvailabilitySelector";
import Header from "../components/Header";
import { buscarEnderecoPorCep } from "../services/viacep";

type Turn = "manhã" | "tarde" | "noite" | "madrugada";

type AvailabilityItem = {
  day: Date;
  availableTurns: Turn[];
};

export default function EditPlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerTurn: "",
    address: {
      cep: "",
      pais: "",
      estado: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
    },
  });

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) fetchPlaceData();
  }, [id]);

  const fetchPlaceData = async () => {
    try {
      const response = await PlaceService.getPlaceById(id!);
      const place = response.data;
      setFormData({
        name: place.name,
        description: place.description,
        pricePerTurn: place.pricePerTurn.toString(),
        address: place.address,
      });
      setAvailability(place.availability);
    } catch (err) {
      setError("Erro ao carregar dados do espaço.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in formData.address) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "").slice(0, 8);
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, cep },
    }));

    if (cep.length === 8) {
      try {
        const endereco = await buscarEnderecoPorCep(cep);
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            rua: endereco.logradouro || "",
            bairro: endereco.bairro || "",
            cidade: endereco.localidade || "",
            estado: endereco.uf || "",
            pais: "Brasil",
          },
        }));
      } catch {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        pricePerTurn: parseFloat(formData.pricePerTurn),
        availability,
      };
      await PlaceService.updatePlace(id!, payload);
      setSuccess("Espaço atualizado com sucesso!");
      setTimeout(() => navigate("/meus-espacos"), 2000);
    } catch (err: any) {
      console.error("Erro ao atualizar espaço:", err);
      setError("Erro ao atualizar espaço.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <div className="flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-center text-black mb-4">
            Editar Espaço
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
              required
              className="w-full p-2 border rounded text-black"
            />
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição"
              className="w-full p-2 border rounded text-black"
            />
            <input
              name="pricePerTurn"
              value={formData.pricePerTurn}
              onChange={handleChange}
              placeholder="Preço por turno"
              type="number"
              required
              className="w-full p-2 border rounded text-black"
            />

            <AvailabilitySelector onChange={setAvailability} />

            <h2 className="text-lg text-black font-semibold mt-6">Endereço</h2>

            {Object.keys(formData.address)
              .filter(
                (field) => !["id", "createdAt", "updatedAt"].includes(field)
              )
              .map((field) => (
                <input
                  key={field}
                  name={field}
                  value={
                    formData.address[field as keyof typeof formData.address]
                  }
                  onChange={field === "cep" ? handleCepChange : handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full p-2 border rounded text-black"
                  required={field !== "complemento"}
                />
              ))}

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
