import { useEffect, useState } from "react";
import { RatingService, RentService } from "../services/api";
import Header from "../components/Header";
import { getUserIdFromToken } from "../utils/auth";
import { FiCheck, FiStar } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function MyRents() {
  const [rents, setRents] = useState<any[]>([]);
  const [filter, setFilter] = useState<"received" | "made">("received");
  const [selectedRent, setSelectedRent] = useState<any | null>(null);
  const [ratedOwners, setRatedOwners] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [ratingStep, setRatingStep] = useState<"owner" | "place">("owner");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [ratingDescription, setRatingDescription] = useState("");
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const loggedUserId = getUserIdFromToken();

  useEffect(() => {
    fetchRents();
    fetchRatings();
  }, [filter]);

  const fetchRatings = async () => {
    try {
      if (loggedUserId) {
        const response = await RatingService.getRatingsByUser(loggedUserId);
        setUserRatings(response.data);
      }
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    }
  };

  const hasRatedRent = (rentId: string, reviewerId: string) => {
    return userRatings.some(
      (r) => r.rentId === rentId && r.reviewerId === reviewerId
    );
  };

  const ratingLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "Ruim",
    2: "Regular",
    3: "Bom",
    4: "Muito bom",
    5: "Excelente",
  };

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
          ? rent.owner?.id === userId && rent.status !== "pendente"
          : rent.renter?.id === userId && rent.status !== "pendente"
      );
      setRents(filtered);
    } catch (err) {
      console.error("Erro ao carregar locações:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateOwner = (ownerId: string, rating: number) => {
    setRatedOwners((prev) => ({ ...prev, [ownerId]: rating }));
  };

  const handleSubmitRatings = async () => {
    if (!userId || !selectedRent) return;

    const reviewedUserId =
      filter === "received" ? selectedRent.renter?.id : selectedRent.owner?.id;

    try {
      await RatingService.rateUser({
        reviewerId: userId,
        reviewedId: reviewedUserId,
        rentId: selectedRent.id,
        rating: ratedOwners[reviewedUserId],
        description: ratingDescription,
      });

      await RatingService.updateUserAverageRating(reviewedUserId);
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
    } finally {
      setSelectedRent(null);
      setRatingStep("owner");
      setRatingDescription("");
    }
  };

  const currentRating = selectedRent
    ? hoveredStar ||
      (ratingStep === "owner" ? ratedOwners[selectedRent.owner?.id] : null)
    : null;

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
              const alreadyRated = hasRatedRent(rent.id, loggedUserId || "");

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
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    Status:
                    {rent.status === "finalizado" ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Finalizado
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {rent.status.charAt(0).toUpperCase() +
                          rent.status.slice(1)}
                      </span>
                    )}
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
                    {rent.schedules?.map((s: any, i: number) => (
                      <div key={i}>
                        {new Date(`${s.day}T12:00:00`).toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        – {s.turns.join(", ")}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    {rent.status !== "finalizado" && (
                      <button
                        className="flex items-center gap-2 px-3 py-1 rounded text-white bg-purple-500 hover:bg-purple-600 transition"
                        onClick={async () => {
                          const confirm = window.confirm(
                            "Tem certeza que deseja finalizar esta locação?"
                          );
                          if (!confirm) return;
                          try {
                            await RentService.finalizeRent(rent.id);
                            fetchRents();
                          } catch (err) {
                            alert("Erro ao finalizar a locação.");
                          }
                        }}
                      >
                        <FiCheck className="text-white" />
                        Finalizar
                      </button>
                    )}

                    {rent.status !== "rejeitado" && !alreadyRated ? (
                      <button
                        className="flex items-center gap-2 px-3 py-1 rounded text-white bg-purple-500 hover:bg-purple-600 transition"
                        onClick={() => setSelectedRent(rent)}
                      >
                        <FiStar className="text-white" />
                        Avaliar
                      </button>
                    ) : rent.status === "finalizado" && alreadyRated ? (
                      <span className="flex items-center gap-2 px-3 py-1 rounded text-white bg-emerald-200">
                        <FiStar className="text-white" />
                        Avaliado
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRent && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => {
            setSelectedRent(null);
            setRatingStep("owner");
          }}
        >
          <div
            className="bg-gray-100 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">
              Avaliação – Proprietário
            </h2>

            <p className="text-center text-gray-600 text-sm mb-4">
              Como você avalia o proprietário?
            </p>

            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const selected = ratedOwners[selectedRent.owner?.id];
                  const isFilled = hoveredStar
                    ? star <= hoveredStar
                    : star <= selected;

                  return (
                    <button
                      key={star}
                      onClick={() =>
                        handleRateOwner(selectedRent.owner.id, star)
                      }
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                      className="text-yellow-400 text-2xl transition-transform transform hover:scale-110"
                    >
                      {isFilled ? <FaStar /> : <FaRegStar />}
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-purple-700 font-medium h-5">
                {currentRating
                  ? ratingLabels[currentRating as 1 | 2 | 3 | 4 | 5]
                  : ""}
              </p>

              {/* Novo campo de descrição */}
              <textarea
                className="w-full mt-2 p-2 border text-black border-gray-300 rounded text-sm resize-none"
                rows={3}
                placeholder="Deixe um comentário (opcional)"
                value={ratingDescription}
                onChange={(e) => setRatingDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setSelectedRent(null);
                  setRatingStep("owner");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRatings}
                className="px-4 py-2 rounded text-white font-semibold transition bg-green-500 hover:bg-green-600"
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
