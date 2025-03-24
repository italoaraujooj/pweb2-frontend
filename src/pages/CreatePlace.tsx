import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaceService } from "../services/api";
import AvailabilitySelector from "../components/AvailabilitySelector";
import Header from "../components/Header";
import { buscarEnderecoPorCep } from "../services/viacep";

export default function CreatePlace() {
  const navigate = useNavigate();

  const [availability, setAvailability] = useState<
    { day: Date; availableTurns: string[] }[]
  >([]);

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    let cep = e.target.value.replace(/\D/g, "").slice(0, 8); // apenas números e até 8 dígitos

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
            cep,
          },
        }));
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
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
        availability: availability.map((item) => ({
          day: item.day.toISOString(),
          availableTurns: item.availableTurns,
        })),
      };
  
      await PlaceService.createPlace(payload); // 🔹 Usando serviço do frontend
      setSuccess("Espaço cadastrado com sucesso!");
      setTimeout(() => navigate("/home"), 2000);
    } catch (err: any) {
      console.error("Erro ao criar espaço:", err);
      setError(err.response?.data?.message || "Erro ao criar espaço.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-black text-2xl font-bold text-center mb-6">
          Criar Novo Espaço
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome"
            required
            className="w-full text-black p-2 border rounded"
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição"
            className="w-full text-black p-2 border rounded"
          />
          <input
            name="pricePerTurn"
            value={formData.pricePerTurn}
            onChange={handleChange}
            placeholder="Preço por turno"
            type="number"
            required
            className="w-full text-black p-2 border rounded"
          />

          <AvailabilitySelector onChange={setAvailability} />

          <h2 className="text-lg text-black font-semibold">Endereço</h2>

          {Object.keys(formData.address).map((field) => (
            <input
              key={field}
              name={field}
              value={formData.address[field as keyof typeof formData.address]}
              onChange={field === "cep" ? handleCepChange : handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full p-2 text-black border rounded"
              required={field !== "complemento"}
            />
          ))}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Cadastrar Espaço
          </button>
        </form>
      </div>
    </div>
  );
}
