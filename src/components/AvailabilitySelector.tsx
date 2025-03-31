import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiTrash } from "react-icons/fi";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

const turnsList = ["manhã", "tarde", "noite", "madrugada"] as const;
type Turn = (typeof turnsList)[number];

type AvailabilityItem = { day: Date; availableTurns: Turn[] };

interface AvailabilitySelectorProps {
  onChange: (availability: AvailabilityItem[]) => void;
}

export default function AvailabilitySelector({
  onChange,
}: AvailabilitySelectorProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTurns, setSelectedTurns] = useState<Turn[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);

  const toggleDate = (date: Date | null) => {
    if (!date) return;

    setSelectedDates((prev) => {
      const isSelected = prev.some(
        (d) => d.toDateString() === date.toDateString()
      );
      return isSelected
        ? prev.filter((d) => d.toDateString() !== date.toDateString())
        : [...prev, date];
    });
  };

  const toggleTurn = (turn: Turn) => {
    setSelectedTurns((prev) =>
      prev.includes(turn) ? prev.filter((t) => t !== turn) : [...prev, turn]
    );
  };

  const addAvailability = () => {
    if (selectedDates.length === 0 || selectedTurns.length === 0) return;

    const newItems: AvailabilityItem[] = [];

    selectedDates.forEach((date) => {
      const existing = availability.find(
        (item) => item.day.toDateString() === date.toDateString()
      );

      if (existing) {
        const newTurns = selectedTurns.filter(
          (t) => !existing.availableTurns.includes(t)
        );
        if (newTurns.length > 0) {
          existing.availableTurns = [...existing.availableTurns, ...newTurns];
        }
      } else {
        newItems.push({ day: date, availableTurns: [...selectedTurns] });
      }
    });

    const updated = [...availability, ...newItems];

    // Ordena por data
    updated.sort((a, b) => a.day.getTime() - b.day.getTime());

    setAvailability([...updated]);
    onChange([...updated]);
    setSelectedDates([]);
    setSelectedTurns([]);
  };

  const removeItem = (index: number) => {
    const updated = availability.filter((_, i) => i !== index);
    setAvailability(updated);
    onChange(updated);
  };

  useEffect(() => {
    onChange(availability);
  }, [availability]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* CALENDÁRIO */}
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold text-gray-700 mb-2">
            Selecione os dias:
          </h3>
          <DatePicker
            inline
            locale="pt-BR"
            highlightDates={selectedDates}
            onChange={toggleDate}
            minDate={new Date()}
            dayClassName={(date) => {
              const isSelected = selectedDates.some(
                (d) => d.toDateString() === date.toDateString()
              );
              return isSelected ? "bg-purple-500 text-white rounded-full" : "";
            }}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedDates.map((date, idx) => (
              <span
                key={idx}
                className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm"
              >
                {date.toLocaleDateString("pt-BR")}
              </span>
            ))}
          </div>
        </div>

        {/* TURNOS */}
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold text-gray-700 mb-2">
            Selecione os turnos:
          </h3>
          <div className="text-black grid grid-cols-1 gap-4">
            {turnsList.map((turn) => (
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
            onClick={addAvailability}
            disabled={selectedDates.length === 0 || selectedTurns.length === 0}
            className={`mt-6 px-4 py-2 rounded transition text-white 
                ${
                  selectedDates.length === 0 || selectedTurns.length === 0
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-600 cursor-pointer"
                }
                `}
          >
            Adicionar Disponibilidade
          </button>
        </div>
      </div>

      {/* Lista de Disponibilidade Atual */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-2">
          Disponibilidade atual:
        </h4>
        <ul className="text-sm text-gray-800 grid grid-cols-1 space-y-2">
          {availability.map((item, i) => (
            <li key={i} className="flex items-center group p-2 rounded">
              <span>
                {item.day.toLocaleDateString("pt-BR")} -{" "}
                {item.availableTurns.join(", ")}
              </span>
              <button
                onClick={() => removeItem(i)}
                className="text-gray-500 cursor-pointer hover:text-red-600 ml-2 hidden group-hover:block transition outline-none focus:outline-none bg-transparent"
              >
                <FiTrash size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
