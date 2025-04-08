import { useEffect, useState } from "react";
import { RentService } from "../services/api";
import Header from "../components/Header";
import { getUserIdFromToken } from "../utils/auth";

export default function PendingRequests() {
  const [rents, setRents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"received" | "made">("received");
  const userId = getUserIdFromToken();

  const fetchPendingRents = async () => {
    setLoading(true);
    try {
      const response = await RentService.getUserRents();
      const filtered = response.data.filter(
        (rent: any) =>
          rent.status === "pendente" &&
          (filter === "received"
            ? rent.owner?.id === userId
            : rent.renter?.id === userId)
      );
      setRents(filtered);
    } catch (err: any) {
      setError("Erro ao buscar solicitações pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRents();
  }, [filter]);

  const handleAction = async (
    id: string,
    status: "confirmado" | "rejeitado"
  ) => {
    try {
      await RentService.approveRent(id, status);
      fetchPendingRents();
    } catch (err) {
      alert("Erro ao atualizar status da locação.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <Header />
      <div className="max-w-5xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-black text-center mb-6">
          Solicitações Pendentes
        </h1>

        {/* Abas */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setFilter("received")}
            className={`px-4 py-2 rounded font-medium ${
              filter === "received"
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Recebidas
          </button>
          <button
            onClick={() => setFilter("made")}
            className={`px-4 py-2 rounded font-medium ${
              filter === "made"
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Feitas por Mim
          </button>
        </div>

        {loading && <p className="text-center">Carregando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {rents.length === 0 && !loading && (
          <p className="text-gray-600 text-center">
            Nenhuma solicitação pendente encontrada.
          </p>
        )}

        <ul className="space-y-4">
          {rents.map((rent: any) => {
            const other = filter === "received" ? rent.renter : rent.owner;

            return (
              <li
                key={rent.id}
                className="bg-white shadow text-black rounded p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={other?.profileImage || "/default-avatar.png"}
                    alt="Foto do solicitante"
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div>
                    <p>
                      <strong>
                        {filter === "received" ? "Solicitante" : "Proprietário"}
                        :
                      </strong>{" "}
                      {other?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {other?.email}
                    </p>
                  </div>
                </div>

                <p className="mt-2">
                  <strong>Espaço:</strong> {rent.place?.name} –{" "}
                  <strong>Valor total:</strong> R$ {rent.totalValue?.toFixed(2)}
                </p>

                <p>
                  <strong>Forma de pagamento:</strong>{" "}
                  {rent.paymentMethod.toUpperCase()}
                </p>

                <p>
                  <strong>Data da solicitação:</strong>{" "}
                  {new Date(rent.createdAt).toLocaleString("pt-BR")}
                </p>

                {filter === "received" && (
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => handleAction(rent.id, "confirmado")}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleAction(rent.id, "rejeitado")}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
