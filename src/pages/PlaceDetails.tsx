import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlaceService, UserService } from "../services/api";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { registerLocale } from "react-datepicker";

registerLocale("pt-BR", ptBR);

export default function PlaceDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState<any>(null);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTurns, setAvailableTurns] = useState<string[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchUser = async (id: any) => {
    try {
      const response = await UserService.getUserById(id!);
      setOwner(response.data);
    }
    catch (err: any) {
      console.log(err);
      setError("Erro ao carregar dados do proprietário.")
    }
  };

  const fetchPlace = async () => {
    try {
      const response = await PlaceService.getPlaceById(id!);
      setPlace(response.data);

      const loggedInUserId = localStorage.getItem("userId");
      if (response.data.ownerId === loggedInUserId) {
        setIsOwner(true);
      }
      fetchUser(response.data.ownerId);
    } catch (err: any) {
      setError("Erro ao carregar os dados do espaço.");
    }
  };

  const availabilityMap = new Map<string, string[]>();

  place?.availability?.forEach((item: any) => {
    const key = new Date(item.day).toDateString();
    availabilityMap.set(key, item.availableTurns);
  });

  const isDateAvailable = (date: Date) => {
    return availabilityMap.has(date.toDateString());
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const key = date.toDateString();
      setAvailableTurns(availabilityMap.get(key) || []);
    }
  };

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!place) return <p className="text-center">Carregando...</p>;

  return (
    <div className="min-h-screen min-w-screen text-black bg-gray-50 p-6">
      <Header />
      <div className="max-w-5xl mx-auto  py-6 px-4">
        <h1 className="text-3xl text-center font-bold mb-4">{place.name}</h1>

        <p className="mb-2">
          <strong>Avaliação:</strong> {place.averageRating}
        </p>

        <p className="mb-2">
          <strong>Endereço:</strong> {place.address?.rua},{" "}
          {place.address?.numero} - {place.address?.bairro},{" "}
          {place.address?.cidade} - {place.address?.estado}
        </p>

        <p className="mb-2">
          <strong>Descrição:</strong> {place.description || "Sem descrição."}
        </p>

        <p className="mb-4">
          <strong>Preço por turno:</strong> R$ {place.pricePerTurn?.toFixed(2)}
        </p>

        {owner && (
        <p className="mb-2">
          <strong>Dono:</strong>{" "}
          <button
            onClick={() => navigate(`/user/${owner.id}`)}
            className="text-purple-700 hover:underline"
          >
            {owner.name}
          </button>
        </p>)}

        {/* Disponibilidade com calendário */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Disponibilidade:</h3>
          <DatePicker
            inline
            locale="pt-BR"
            selected={selectedDate}
            onChange={handleDateChange}
            highlightDates={place.availability?.map(
              (item: any) => new Date(item.day)
            )}
            filterDate={isDateAvailable}
            placeholderText="Selecione uma data"
            minDate={new Date()}
          />
          {selectedDate && (
            <div className="mt-4">
              <strong>
                Turnos disponíveis em {selectedDate.toLocaleDateString("pt-BR")}
                :
              </strong>
              <ul className="list-disc ml-6 mt-1">
                {availableTurns.length > 0 ? (
                  availableTurns.map((turn, i) => <li key={i}>{turn}</li>)
                ) : (
                  <li>Nenhum turno disponível</li>
                )}
              </ul>
            </div>
          )}
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
          <button
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            onClick={() => navigate(`/request/${id}`)}
          >
            Solicitar Aluguel
          </button>
        )}
      </div>
    </div>
  );
}
