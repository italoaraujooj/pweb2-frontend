import { useEffect, useState } from "react";
import { RentService } from "../services/api";
import Header from "../components/Header";
import { getUserIdFromToken } from "../utils/auth";

export default function MyRents() {
  const [rents, setRents] = useState<any[]>([]);
  const [filter, setFilter] = useState<"received" | "made">("received");
  const [loading, setLoading] = useState(true);

  const userId = getUserIdFromToken();

  useEffect(() => {
    fetchRents();
  }, [filter]);

  const fetchRents = async () => {
    try {
      setLoading(true);
      const response = await RentService.getUserRents();

      const filtered = response.data.filter((rent: any) =>
        filter === "received"
          ? rent.owner?.id === userId && rent.status === "confirmado"
          : rent.renter?.id === userId && rent.status === "confirmado"
      );

      setRents(filtered);
    } catch (err) {
      console.error("Erro ao carregar locações:", err);
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
              filter === "received"
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Meus Espaços
          </button>
          <button
            onClick={() => setFilter("made")}
            className={`px-4 py-2 rounded font-medium ${
              filter === "made"
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Espaços Alugados
          </button>
        </div>

        {loading ? (
          <p className="text-center">Carregando locações...</p>
        ) : rents.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhuma locação encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rents.map((rent) => {
              const other = filter === "received" ? rent.renter : rent.owner;

              return (
                <div
                  key={rent.id}
                  className="bg-white p-4 rounded shadow hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={other?.profileImage || "/default-avatar.png"}
                      alt="Foto do usuário"
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                    />
                    <div className="text-black">
                      <p>
                        <strong>
                          {filter === "received" ? "Locatário" : "Proprietário"}
                          :
                        </strong>{" "}
                        {other?.name}
                      </p>
                      <p className="text-sm text-gray-600">{other?.email}</p>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-800">
                    {rent.place?.name || "Espaço"}
                  </h2>

                  <p className="text-sm text-gray-600 mb-1">
                    Status: <span className="font-medium">{rent.status}</span>
                  </p>

                  <p className="text-sm text-gray-600 mb-1">
                    Total:{" "}
                    <span className="font-medium">
                      R$ {rent.totalValue?.toFixed(2)}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600 mb-1">
                    Forma de pagamento:{" "}
                    <span className="uppercase">{rent.paymentMethod}</span>
                  </p>

                  <p className="text-sm text-gray-600 mb-1">
                    Solicitado em:{" "}
                    {new Date(rent.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                  <div className="text-sm text-gray-500 mt-2">
                    <p className="font-medium">Horários:</p>
                    {rent.schedules.map((s: any, i: number) => (
                      <div key={i}>
                        {s.day} – {s.turns.join(", ")}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
