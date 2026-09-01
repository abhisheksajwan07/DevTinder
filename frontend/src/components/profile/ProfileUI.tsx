import React from "react";

export const readable = (value: string) => value.replaceAll("_", " ");

export function PageMessage({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`mx-auto max-w-2xl px-4 py-16 text-center text-sm ${
        error ? "text-red-600" : "text-[#77736e]"
      }`}
    >
      {children}
    </div>
  );
}

export function Avatar({
  name,
  url,
}: {
  name: string;
  url: string | null | undefined;
}) {
  return (
    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-orange-500 text-xl font-bold text-white">
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
      {children}
    </p>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f5f2] px-2.5 py-1">
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#55504b]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function SelectField({
  label,
  value,
  values,
  readable: format,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  readable?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#55504b]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control"
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {format ? readable(item) : item}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ChoiceGroup({
  label,
  items,
  selected,
  onToggle,
  accent,
}: {
  label: string;
  items: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#55504b]">{label}</p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              selected.includes(item.id)
                ? accent
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-[#1a1918] bg-[#1a1918] text-white"
                : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
