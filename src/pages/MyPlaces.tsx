import { useEffect, useState } from "react";
import { PlaceService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function MyPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPlaces();
  }, []);

  const fetchMyPlaces = async () => {
    try {
      const response = await PlaceService.getOwnPlaces(); // 👈 chamada ao backend
      setPlaces(response.data);
      console.log(response);
    } catch (err: any) {
      console.error("Erro ao buscar seus espaços:", err);
      setError("Erro ao buscar seus espaços.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <h1 className="text-3xl font-bold text-black text-center mb-6 py-6 px-4">
        Meus Espaços
      </h1>

      {loading && <p className="text-center">Carregando...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className="text-center text-gray-600">
          Você ainda não cadastrou nenhum espaço.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place: any) => (
          <div
            key={place.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {place.name}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              {place.address?.rua}, {place.address?.cidade} -{" "}
              {place.address?.estado}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              R$ {place.pricePerTurn?.toFixed(2)} / turno
            </p>
            <button
              onClick={() => navigate(`/place/${place.id}`)}
              className="mt-2 w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition"
            >
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
