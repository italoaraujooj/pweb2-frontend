import { useEffect, useState } from "react";
import { RentService } from "../services/api";
import Header from "../components/Header";

export default function MyRents() {
  const [rents, setRents] = useState<any[]>([]);
  const [filter, setFilter] = useState<"received" | "made">("received");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRents();
  }, [filter]);

  const fetchRents = async () => {
    try {
      setLoading(true);
      const response = await RentService.getUserRents();
      const userId = localStorage.getItem("userId");

      const filtered = response.data.filter((rent: any) =>
        filter === "received" ? rent.ownerId === userId : rent.renterId === userId
      );

      setRents(filtered);
    } catch (err) {
      console.error("Erro ao carregar locacoes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />

      <div className="max-w-5xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold text-center text-black mb-4">
          Minhas Locações
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setFilter("received")}
            className={`px-4 py-2 rounded font-medium ${
              filter === "received" ? "bg-purple-500 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Meus Espaços
          </button>
          <button
            onClick={() => setFilter("made")}
            className={`px-4 py-2 rounded font-medium ${
              filter === "made" ? "bg-purple-500 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Espaços Alugados
          </button>
        </div>

        {loading ? (
          <p className="text-center">Carregando locacoes...</p>
        ) : rents.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhuma locação encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rents.map((rent) => (
              <div
                key={rent.id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {rent.place?.name || "Espaço"}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  Status: <span className="font-medium">{rent.status}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Total: <span className="font-medium">R$ {rent.totalValue?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Horários:
                  {rent.schedules.map((s: any, index: number) => (
                    <div key={index}>
                      {new Date(s.startDate).toLocaleString()} - {new Date(s.endDate).toLocaleString()}
                    </div>
                  ))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}