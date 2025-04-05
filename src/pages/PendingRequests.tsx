import { useEffect, useState } from "react";
import { PlaceService, RentService, UserService } from "../services/api";
import Header from "../components/Header";
import { getUserIdFromToken } from "../utils/auth";

export default function PendingRequests() {
  const [pendingRents, setPendingRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [places, setPlaces] = useState([]);
  const [renters, setRenters] = useState<any[]>([]);
  const userId = getUserIdFromToken();

  const fetchRenters = async (renterIds:any[]) => {
    try {
      const renters = [];
      for (let index = 0; index < renterIds.length; index++) {
        const id = renterIds[index];
        const response = await UserService.getUserById(id!);
        renters.push(response.data);
      }
      setRenters(renters);
    } catch (err:any) {
      setError("Erro ao buscar solicitantes.")
    }
  }

  const fetchPendingRents = async () => {
    setLoading(true);
    try {
      const response = await RentService.getUserRents();
      const filtered = response.data.filter(
        (rent: any) => rent.status === "pendente" && rent.ownerId === userId
      );
      const placesResponse = await PlaceService.getOwnPlaces();
      setPlaces(placesResponse.data);
      setPendingRents(filtered);
      await fetchRenters(filtered.map((rent:any) => rent.renterId));
    } catch (err: any) {
      setError("Erro ao buscar solicitações pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRents();
  }, []);

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

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {pendingRents.length === 0 && !loading && (
          <p className="text-gray-600 text-center">
            Nenhuma solicitação pendente encontrada.
          </p>
        )}

        <ul className="space-y-4">
          {pendingRents.map((rent: any) => {
            const place:any = places.filter((place:any) => rent.placeId === place.id)[0];
            console.log(places);
            const renter:any = renters.filter((renter:any) => rent.renterId === renter.id)[0];
            return (
            <li key={rent.id} className="bg-white shadow text-black rounded p-4">
              <p>
                <strong>Espaço:</strong> {place?.name}
              </p>
              <p>
                <strong>Solicitante:</strong> {renter?.name}
              </p>
              <p>
                <strong>Horários:</strong>
              </p>
              <ul className="ml-4 list-disc">
                {rent.schedules?.map((s: any, i: number) => (
                  <li key={i}>
                    {new Date(s.startDate).toLocaleString()} -{" "}
                    {new Date(s.endDate).toLocaleString()}
                  </li>
                ))}
              </ul>
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
            </li>
          )})}
        </ul>
      </div>
    </div>
  );
}
