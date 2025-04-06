import { useEffect, useState } from "react";
import { RatingService, RentService } from "../services/api";
import Header from "../components/Header";
import { getUserIdFromToken } from "../utils/auth";

export default function MyRents() {
  const [rents, setRents] = useState<any[]>([]);
  const [filter, setFilter] = useState<"received" | "made">("received");
  const [selectedRent, setSelectedRent] = useState<any | null>(null); // qual locação está sendo avaliada
  const [ratedOwners, setRatedOwners] = useState<{ [key: string]: number }>({});
  const [ratedPlaces, setRatedPlaces] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const userId = getUserIdFromToken();

  useEffect(() => {
    fetchRents();
  }, [filter]);

  const handleSubmitRatings = async () => {
    if (!userId || !selectedRent) return;
    console.log("Enviando avaliação para usuário...");
  
    try {
      if (ratedOwners[selectedRent.owner?.id] !== undefined) {
        console.log("Payload da avaliação de usuário:", {
          reviewerId: userId,
          reviewedId: selectedRent.owner?.id,
          rentId: selectedRent.id,
          rating: ratedOwners[selectedRent.owner?.id],
        });
        await RatingService.rateUser({
          reviewerId: userId,
          reviewedId: selectedRent.owner?.id,
          rentId: selectedRent.id,
          rating: ratedOwners[selectedRent.owner?.id],
        });
  
        // Atualiza a média do usuário avaliado
        console.log("Atualizando média do usuário...");
        await RatingService.updateUserAverageRating(selectedRent.owner?.id);
      }
  
      if (ratedPlaces[selectedRent.place?.id] !== undefined) {
        console.log("Enviando avaliação para local...");
        await RatingService.rateUser({
          reviewerId: userId,
          reviewedId: selectedRent.place?.id,
          rentId: selectedRent.id,
          rating: ratedPlaces[selectedRent.place?.id],
        });
  
        // Atualiza a média do local avaliado
        console.log("Atualizando média do local...");
        await RatingService.updatePlaceAverageRating(selectedRent.place?.id);
      }
    } catch (err) {
      console.log(err);
      console.error("Erro ao enviar avaliação:", err);
    } finally {
      setSelectedRent(null); // Sempre fecha o modal, com ou sem erro
    }
  };

  const handleRateOwner = (ownerId: string, rating: number) => {
    setRatedOwners((prev) => ({ ...prev, [ownerId]: rating }));
    console.log(`Avaliação do dono (${ownerId}): ${rating}`);
  };
  
  const handleRatePlace = (placeId: string, rating: number) => {
    setRatedPlaces((prev) => ({ ...prev, [placeId]: rating }));
    console.log(`Avaliação do espaço (${placeId}): ${rating}`);
  };

  const fetchRents = async () => {
    try {
      setLoading(true);
      const response = await RentService.getUserRents();

      const filtered = response.data.filter((rent: any) =>
        filter === "received"
          ? rent.owner?.id === userId && rent.status === "confirmado"
          : rent.renter?.id === userId && rent.status === "confirmado"
      );
      console.log(userId);

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
                  <button 
                  className="px-3 py-1 rounded text-white bg-purple-500"
                  onClick={() => setSelectedRent(rent)}
                  >Avaliar</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedRent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedRent(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()} // impede fechar clicando dentro do modal
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Avaliar Locação</h2>

            {/* avaliação do dono */}
            <div className="mb-4">
              <p className="text-gray-700 font-medium">Avaliar Dono:</p>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateOwner(selectedRent.owner?.id, star)}
                    className={`px-3 py-1 rounded text-white ${
                      ratedOwners[selectedRent.owner?.id] === star ? "bg-purple-700" : "bg-purple-500"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* avaliação do espaço */}
            <div className="mb-4">
              <p className="text-gray-700 font-medium">Avaliar Espaço:</p>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatePlace(selectedRent.place?.id, star)}
                    className={`px-3 py-1 rounded text-white ${
                      ratedPlaces[selectedRent.place?.id] === star ? "bg-purple-700" : "bg-purple-500"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRent(null)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRatings}
                className="px-4 py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Concluir Avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
