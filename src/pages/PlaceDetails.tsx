import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PlaceService } from "../services/api";
import Header from "../components/Header";

export default function PlaceDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState<any>(null);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    try {
      const response = await PlaceService.getPlaceById(id!);
      setPlace(response.data);

      const loggedInUserId = localStorage.getItem("userId");
      if (response.data.ownerId === loggedInUserId) {
        setIsOwner(true);
      }
    } catch (err: any) {
      setError("Erro ao carregar os dados do espaço.");
    }
  };

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!place) return <p className="text-center">Carregando...</p>;

  return (
    <div className="min-h-screen min-w-screen text-black bg-gray-50 p-6">
      <Header />
      <div className="max-w-5xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-4">{place.name}</h1>

        <p className="mb-2">
          <strong>Endereço:</strong> {place.address?.rua},{" "}
          {place.address?.numero} - {place.address?.bairro},{" "}
          {place.address?.cidade} - {place.address?.estado}
        </p>

        <p className="mb-2">
          <strong>Descrição:</strong> {place.description || "Sem descrição."}
        </p>

        <p className="mb-2">
          <strong>Preço por turno:</strong> R$ {place.pricePerTurn?.toFixed(2)}
        </p>

        <div className="mb-4">
          <strong>Disponibilidade:</strong>
          <ul className="list-disc ml-5">
            {place.availability?.map((item: any, index: number) => (
              <li key={index}>
                {new Date(item.day).toLocaleDateString()} -{" "}
                {item.availableTurns.join(", ")}
              </li>
            ))}
          </ul>
        </div>

        {place.equipments && place.equipments.length > 0 && (
          <div className="mb-4">
            <strong>Equipamentos disponíveis:</strong>
            <ul className="list-disc ml-5">
              {place.equipments.map((eq: any, i: number) => (
                <li key={i}>
                  {eq.name} - R$ {eq.pricePerTurn.toFixed(2)} / turno
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isOwner && (
          <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
            Solicitar Aluguel
          </button>
        )}
      </div>
    </div>
  );
}
