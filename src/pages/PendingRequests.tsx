import { useEffect, useState } from "react";
import { RentService } from "../services/api";
import Header from "../components/Header";

export default function PendingRequests() {
  const [pendingRents, setPendingRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingRents = async () => {
    setLoading(true);
    try {
      const response = await RentService.getUserRents();
      const filtered = response.data.filter(
        (rent: any) =>
          rent.status === "pending" &&
          rent.ownerId === localStorage.getItem("userId")
      );
      setPendingRents(filtered);
    } catch (err: any) {
      setError("Erro ao buscar solicitações pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRents();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
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

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {pendingRents.length === 0 && !loading && (
          <p className="text-gray-600 text-center">
            Nenhuma solicitação pendente encontrada.
          </p>
        )}

        <ul className="space-y-4">
          {pendingRents.map((rent: any) => (
            <li key={rent.id} className="bg-white shadow rounded p-4">
              <p>
                <strong>Espaço:</strong> {rent.place?.name}
              </p>
              <p>
                <strong>Solicitante:</strong> {rent.renter?.name}
              </p>
              <p>
                <strong>Horários:</strong>
              </p>
              <ul className="ml-4 list-disc">
                {rent.schedules.map((s: any, i: number) => (
                  <li key={i}>
                    {new Date(s.startDate).toLocaleString()} -{" "}
                    {new Date(s.endDate).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleAction(rent.id, "approved")}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction(rent.id, "rejected")}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Rejeitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
