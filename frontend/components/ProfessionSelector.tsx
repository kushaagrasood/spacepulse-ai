const professions = [
  { id: "pilot",        label: "✈️", name: "Pilot" },
  { id: "photographer", label: "📸", name: "Photographer" },
  { id: "farmer",       label: "🌾", name: "Farmer" },
  { id: "student",      label: "🎓", name: "Student" },
  { id: "researcher",   label: "🔬", name: "Researcher" },
  { id: "astronomer",   label: "🔭", name: "Astronomer" },
  { id: "satelliteops",   label: "🛰️", name: "Satellite Ops" },
  { id: "airlineops",   label: "📡", name: "Airline Ops" },
  { id: "maritime",   label: "🚢", name: "Maritime" },
];

interface Props {
  selected: string | null;
  onSelect: (profession: string) => void;
}

export default function ProfessionSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {professions.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`prof-btn ${selected === p.id ? "active" : ""}`}>
          {/* Emoji smaller — it's a visual hint not a headline */}
          <span className="text-xl block mb-2" style={{ opacity: selected === p.id ? 1 : 0.75 }}>
            {p.label}
          </span>
          {/* Name in body font — readable, not shouted */}
          <span className="text-xs font-medium block tracking-wide">
            {p.name}
          </span>
        </button>
      ))}
    </div>
  );
}
