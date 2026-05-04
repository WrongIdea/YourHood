"use client";

import { useState } from "react";
import { Province, Area } from "@/types";
import { PROVINCES, MUNICIPALITIES, WARDS, WardEntry } from "@/lib/mock-data";

interface AreaSelectorProps {
  onSelect: (area: Area) => void;
  onClose: () => void;
  required?: boolean;
}

type Step = "province" | "municipality" | "ward" | "place";

export default function AreaSelector({ onSelect, onClose, required = false }: AreaSelectorProps) {
  const [step, setStep] = useState<Step>("province");
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Area | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardEntry | null>(null);
  const [search, setSearch] = useState("");

  const municipalities = selectedProvince
    ? MUNICIPALITIES.filter((m) => m.province_id === selectedProvince.id)
    : [];

  const hasMunicipalities = municipalities.length > 0;

  const filteredMunicipalities = municipalities.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const wardList: WardEntry[] = selectedMunicipality
    ? (WARDS[selectedMunicipality.id] ?? [])
    : [];

  const filteredWards = wardList.filter((w) => {
    const q = search.toLowerCase();
    return (
      `ward ${w.number}`.includes(q) ||
      w.places.some((p) => p.toLowerCase().includes(q))
    );
  });

  const filteredPlaces = (selectedWard?.places ?? []).filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  function handleProvinceSelect(province: Province) {
    setSelectedProvince(province);
    setSearch("");
    setStep("municipality");
  }

  function handleMunicipalitySelect(area: Area) {
    const wards = WARDS[area.id];
    if (wards && wards.length > 0) {
      setSelectedMunicipality(area);
      setSearch("");
      setStep("ward");
    } else {
      onSelect(area);
      onClose();
    }
  }

  function handleWardSelect(ward: WardEntry) {
    if (!selectedMunicipality) return;
    if (ward.places.length === 1) {
      // Single place — select immediately
      buildAndSelect(ward, ward.places[0]);
    } else {
      // Multiple places — let user pick one
      setSelectedWard(ward);
      setSearch("");
      setStep("place");
    }
  }

  function handlePlaceSelect(place: string) {
    if (!selectedWard) return;
    buildAndSelect(selectedWard, place);
  }

  function buildAndSelect(ward: WardEntry, place: string) {
    if (!selectedMunicipality) return;
    const slug = place.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const area: Area = {
      id: `${selectedMunicipality.id}-w${ward.number}-${slug}`,
      name: place,
      province_id: selectedMunicipality.province_id,
      province_name: selectedMunicipality.province_name,
      municipality_id: selectedMunicipality.id,
      ward_number: ward.number,
      ward_places: ward.places,
    };
    onSelect(area);
    onClose();
  }

  function handleBack() {
    if (step === "place") {
      setStep("ward");
      setSelectedWard(null);
      setSearch("");
    } else if (step === "ward") {
      setStep("municipality");
      setSelectedMunicipality(null);
      setSearch("");
    } else {
      setStep("province");
      setSelectedProvince(null);
      setSearch("");
    }
  }

  const totalSteps = step === "place" ? 4
    : (step === "ward" || wardList.length > 0) ? 3
    : 2;
  const stepIndex = step === "province" ? 0
    : step === "municipality" ? 1
    : step === "ward" ? 2
    : 3;

  const headerTitle =
    step === "province" ? "Select your province"
    : step === "municipality" ? selectedProvince?.name
    : step === "ward" ? selectedMunicipality?.name
    : `Ward ${selectedWard?.number}`;

  const headerSub =
    step === "municipality" ? "Select your municipality"
    : step === "ward" ? "Select your ward"
    : step === "place" ? "Select your place"
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={required ? undefined : onClose} />

      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            {step !== "province" && (
              <button
                onClick={handleBack}
                className="text-zinc-400 hover:text-white transition-colors shrink-0"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <h2 className="text-white font-semibold text-base leading-tight">{headerTitle}</h2>
              {headerSub && <p className="text-zinc-500 text-xs mt-0.5">{headerSub}</p>}
            </div>
            {!required && (
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Required banner */}
          {required && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-3">
              <span className="text-base">📍</span>
              <p className="text-emerald-400 text-xs">Choose your place to start posting in your community</p>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {(step === "municipality" || step === "ward" || step === "place") && (
            <input
              type="text"
              placeholder={
                step === "municipality" ? "Search municipality..."
                : step === "ward" ? "Search ward or place..."
                : "Search place..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 border border-zinc-700"
            />
          )}
        </div>

        {/* Province list */}
        {step === "province" && (
          <ul className="max-h-72 overflow-y-auto">
            {PROVINCES.map((province) => {
              const count = MUNICIPALITIES.filter((m) => m.province_id === province.id).length;
              const available = count > 0;
              return (
                <li key={province.id}>
                  <button
                    onClick={() => available && handleProvinceSelect(province)}
                    disabled={!available}
                    className={`w-full text-left px-5 py-3.5 transition-colors text-sm flex items-center justify-between gap-3 ${
                      available
                        ? "text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                        : "text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">🗺️</span>
                      {province.name}
                    </span>
                    {available ? (
                      <span className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{count} municipalities</span>
                        <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-700">Coming soon</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Municipality list */}
        {step === "municipality" && (
          <ul className="max-h-64 overflow-y-auto">
            {!hasMunicipalities ? (
              <li className="px-5 py-10 text-center text-zinc-500 text-sm">
                No municipalities available yet for {selectedProvince?.name}.
              </li>
            ) : filteredMunicipalities.length === 0 ? (
              <li className="px-5 py-8 text-center text-zinc-500 text-sm">No results found</li>
            ) : (
              filteredMunicipalities.map((area) => {
                const wardCount = WARDS[area.id]?.length ?? 0;
                return (
                  <li key={area.id}>
                    <button
                      onClick={() => handleMunicipalitySelect(area)}
                      className="w-full text-left px-5 py-3.5 text-zinc-200 hover:bg-zinc-800 transition-colors text-sm flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">📍</span>
                        {area.name}
                      </span>
                      {wardCount > 0 && (
                        <span className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{wardCount} wards</span>
                          <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}

        {/* Ward list */}
        {step === "ward" && (
          <ul className="max-h-64 overflow-y-auto">
            {filteredWards.length === 0 ? (
              <li className="px-5 py-8 text-center text-zinc-500 text-sm">No results found</li>
            ) : (
              filteredWards.map((ward) => (
                <li key={ward.number}>
                  <button
                    onClick={() => handleWardSelect(ward)}
                    className="w-full text-left px-5 py-3 text-zinc-200 hover:bg-zinc-800 transition-colors text-sm flex items-center justify-between gap-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                        {ward.number}
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">Ward {ward.number}</span>
                        <span className="text-zinc-500 text-xs">{ward.places.join(", ")}</span>
                      </span>
                    </span>
                    {ward.places.length > 1 && (
                      <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        {/* Place list */}
        {step === "place" && (
          <ul className="max-h-64 overflow-y-auto">
            {filteredPlaces.length === 0 ? (
              <li className="px-5 py-8 text-center text-zinc-500 text-sm">No results found</li>
            ) : (
              filteredPlaces.map((place) => (
                <li key={place}>
                  <button
                    onClick={() => handlePlaceSelect(place)}
                    className="w-full text-left px-5 py-3.5 text-zinc-200 hover:bg-zinc-800 transition-colors text-sm flex items-center gap-3"
                  >
                    <span className="text-base">🏘️</span>
                    <span>{place}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
