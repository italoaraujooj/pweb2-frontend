import { useEffect, useState } from "react";
import { RentService } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaces();
  }, [page]);

  const fetchPlaces = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await RentService.getAvailablePlaces(page, limit);
      setPlaces(response.data.places || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Erro ao carregar espaços:", err);
      setError("Erro ao carregar os espaços disponíveis.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRent = (placeId: string) => {
    navigate(`/place/${placeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Espaços Disponíveis
      </h1>

      {loading && <p className="text-center">Carregando espaços...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className="text-center text-gray-600">
          Nenhum espaço disponível no momento.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {place.name}
            </h2>
            <p className="text-gray-600 text-sm mb-1">
              {place.address?.rua}, {place.address?.cidade} -{" "}
              {place.address?.estado}
            </p>
            <p className="text-gray-800 font-medium mb-1">
              R$ {place.pricePerTurn.toFixed(2)}/turno
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Turnos disponíveis:{" "}
              {place.availability
                ?.map((a: any) => `${a.day} (${a.availableTurns.join(", ")})`)
                .join(" | ") || "Não informado"}
            </p>
            <button
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition"
              onClick={() => handleRequestRent(place.id)}
            >
              Solicitar Aluguel
            </button>
          </div>
        ))}
      </div>

      {!loading && !error && places.length > 0 && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-700 font-medium">Página {page}</span>
          <button
            onClick={() =>
              setPage((prev) => (page < totalPages ? prev + 1 : prev))
            }
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
