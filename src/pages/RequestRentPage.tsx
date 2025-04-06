import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlaceService, RentService } from "../services/api";
import Header from "../components/Header";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getUserIdFromToken } from "../utils/auth";
import { ptBR } from "date-fns/locale/pt-BR";
import { enCA } from "date-fns/locale/en-CA";

registerLocale("pt-BR", ptBR);
registerLocale("en-CA", enCA);

const turnsList = ["manhã", "tarde", "noite", "madrugada"] as const;
type Turn = (typeof turnsList)[number];

interface Schedule {
  day: string;
  turns: Turn[];
}

export default function RequestRentPage() {
  const { id: placeId } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTurns, setSelectedTurns] = useState<Turn[]>([]);
  const [availableTurns, setAvailableTurns] = useState<Turn[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = getUserIdFromToken();

  useEffect(() => {
    if (placeId) fetchPlace();
  }, [placeId]);

  const fetchPlace = async () => {
    try {
      const res = await PlaceService.getPlaceById(placeId!);
      setPlace(res.data.place || res.data);
    } catch {
      setError("Erro ao carregar o espaço.");
    }
  };

  const toggleDate = (date: Date | null) => {
    if (!date || !place) return;

    const isAvailable = place.availability.some(
      (a: any) => new Date(a.day).toDateString() === date.toDateString()
    );

    if (!isAvailable) return;

    const updatedDates = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    )
      ? selectedDates.filter((d) => d.toDateString() !== date.toDateString())
      : [...selectedDates, date];

    setSelectedDates(updatedDates);

    // Atualizar os turnos disponíveis com base na nova data selecionada
    if (!selectedDates.some((d) => d.toDateString() === date.toDateString())) {
      const matched = place.availability.find(
        (a: any) => new Date(a.day).toDateString() === date.toDateString()
      );
      setAvailableTurns(matched?.availableTurns || []);
      setSelectedTurns([]);
    }
  };

  const toggleTurn = (turn: Turn) => {
    setSelectedTurns((prev) =>
      prev.includes(turn) ? prev.filter((t) => t !== turn) : [...prev, turn]
    );
  };

  const addSchedules = () => {
    if (selectedDates.length === 0 || selectedTurns.length === 0 || !place)
      return;

    const newSchedules: Schedule[] = selectedDates.map((date) => {
      const day = date.toLocaleDateString("en-CA");
      const availableDay = place.availability.find(
        (a: any) => new Date(a.day).toDateString() === date.toDateString()
      );
      const validTurns = selectedTurns.filter((t) =>
        availableDay?.availableTurns.includes(t)
      );
      return {
        day,
        turns: validTurns,
      };
    });

    const merged = [...schedules];

    newSchedules.forEach((item) => {
      const existing = merged.find((s) => s.day === item.day);
      if (existing) {
        existing.turns = Array.from(
          new Set([...existing.turns, ...item.turns])
        );
      } else {
        merged.push(item);
      }
    });

    merged.sort((a, b) => a.day.localeCompare(b.day));
    setSchedules(merged);
    setSelectedDates([]);
    setSelectedTurns([]);
    setAvailableTurns([]);
  };

  const removeSchedule = (day: string) => {
    setSchedules((prev) => prev.filter((s) => s.day !== day));
  };

  const totalValue = schedules.reduce(
    (total, s) => total + s.turns.length * (place?.pricePerTurn || 0),
    0
  );

  const handleSubmit = async () => {
    try {
      await RentService.requestRent({
        placeId: placeId || "",
        ownerId: place.ownerId,
        renterId: userId || "",
        totalValue,
        status: "pendente",
        paymentMethod,
        schedules,
      });
      setSuccess("Solicitação enviada com sucesso!");
      setTimeout(() => navigate("/rents"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao solicitar aluguel.");
    }
  };

  const isDayAvailable = (date: Date) => {
    if (!place) return false;
    return place.availability.some(
      (a: any) => new Date(a.day).toDateString() === date.toDateString()
    );
  };

  const formatLocalDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    const localDate = new Date(year, month - 1, day); // Note que o mês começa em 0
    return localDate.toLocaleDateString("pt-BR"); // ou "en-CA" se preferir manter o padrão
  };

  return (
    <div className="min-h-screen text-black min-w-screen bg-gray-50 p-6">
      <Header />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-4">
          Solicitar Aluguel
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-600 text-center mb-4">{success}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Selecione os dias:</h2>
            <DatePicker
              inline
              locale="pt-BR"
              highlightDates={selectedDates}
              onChange={toggleDate}
              minDate={new Date()}
              filterDate={isDayAvailable}
              dayClassName={(date) => {
                const isSelected = selectedDates.some(
                  (d) => d.toDateString() === date.toDateString()
                );
                return isSelected
                  ? "bg-purple-500 text-white rounded-full"
                  : "";
              }}
            />
          </div>

          <div>
            <h2 className="font-semibold mb-2">Selecione os turnos:</h2>
            <div className="flex flex-col gap-2 text-black">
              {availableTurns.map((turn) => (
                <label key={turn} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTurns.includes(turn)}
                    onChange={() => toggleTurn(turn)}
                  />
                  {turn}
                </label>
              ))}
            </div>

            <button
              onClick={addSchedules}
              disabled={
                selectedDates.length === 0 || selectedTurns.length === 0
              }
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Adicionar Disponibilidade
            </button>
          </div>
        </div>

        {schedules.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Agendamentos Selecionados:</h2>
            <ul className="list-disc ml-6 text-sm">
              {schedules.map((s) => (
                <li key={s.day} className="flex justify-between items-center">
                  <span>
                    {formatLocalDate(s.day)} - {s.turns.join(", ")}
                  </span>
                  <button
                    onClick={() => removeSchedule(s.day)}
                    className="text-red-500 text-xs ml-4"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <label className="font-semibold block mb-2">
            Forma de Pagamento:
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded text-black"
          >
            <option value="pix">PIX</option>
            <option value="cartao">Cartão</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>

        <div className="mt-6 font-semibold text-lg text-right">
          Total: R$ {totalValue.toFixed(2)}
        </div>

        <button
          onClick={handleSubmit}
          disabled={schedules.length === 0}
          className="mt-6 w-full bg-purple-600 text-white cursor-pointer py-2 rounded hover:bg-purple-700"
        >
          Enviar Solicitação
        </button>
      </div>
    </div>
  );
}
