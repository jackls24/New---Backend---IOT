import React, { useEffect, useState } from "react";
import Table from "./Table";
import CreateMolo from "./CreateMolo";
import { MapPin, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge"; // Importiamo il nuovo componente

const MoloTable = () => {
  const [moli, setMoli] = useState(/** @type {Molo[]} */ ([]));
  const [editMolo, setEditMolo] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    provincia: "",
    capacita: "",
    posti_occupati: "",
    indirizzo: "",
    stato: "",
    latitudine: "",
    longitudine: "",
  });

  useEffect(() => {
    // Fetch dei moli dal backend
    fetch("http://localhost:5001/molo")
      .then((res) => res.json())
      .then((data) => setMoli(data))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { key: "id", label: "ID", render: (value) => `#${value}` },
    { key: "nome", label: "Nome" },
    { key: "provincia", label: "Provincia" },
    { key: "indirizzo", label: "Indirizzo" },
    { key: "capacita", label: "Capacità Totale" },
    { key: "posti_occupati", label: "Posti Occupati" },
    { key: "posti_disponibili", label: "Posti Disponibili" },
    {
      key: "stato",
      label: "Stato",
      render: (value) => <StatusBadge status={value || "non_disponibile"} />,
    },
  ];

  const handleRowClick = (row) => {
    setEditMolo(row);
    setFormData({
      nome: row.nome ?? "",
      provincia: row.provincia ?? "",
      capacita: row.capacita ?? "",
      posti_occupati: row.posti_occupati ?? "",
      indirizzo: row.indirizzo ?? "",
      stato: row.stato ?? "non_disponibile",
      latitudine: row.latitudine ?? "",
      longitudine: row.longitudine ?? "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5001/molo/${editMolo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((errData) => {
            throw new Error("Errore aggiornamento molo: " + errData.error);
          });
        return res.json();
      })
      .then(() => {
        // Aggiorna l'elenco completo dei moli
        fetch("http://localhost:5001/molo")
          .then((res) => res.json())
          .then((data) => {
            setMoli(data);
            setEditMolo(null);
          });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-xl min-h-screen">
      <div className="mb-8 flex items-center">
        <div className="p-3 bg-blue-600 rounded-lg text-white mr-4">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
          Gestione Moli
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
        <Table
          columns={columns}
          data={moli}
          onRowClick={handleRowClick}
          pageSize={5}
          showActionButton={false}
        />
      </div>

      {editMolo && (
        <div className="mt-8 bg-white p-6 border border-blue-100 rounded-xl shadow-md">
          <h2 className="text-xl text-black font-bold mb-4 flex items-center border-b border-blue-100 pb-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white mr-3">
              <MapPin className="w-5 h-5" />
            </div>
            Modifica Molo #{editMolo.id}
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia
                </label>
                <input
                  name="provincia"
                  type="text"
                  value={formData.provincia}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indirizzo
              </label>
              <input
                name="indirizzo"
                type="text"
                value={formData.indirizzo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Nuova sezione per latitudine e longitudine */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitudine
                </label>
                <input
                  name="latitudine"
                  type="number"
                  step="any"
                  value={formData.latitudine}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Es. 45.4642"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitudine
                </label>
                <input
                  name="longitudine"
                  type="number"
                  step="any"
                  value={formData.longitudine}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Es. 9.1900"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacità Totale
                </label>
                <input
                  name="capacita"
                  type="number"
                  value={formData.capacita}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posti Occupati
                </label>
                <input
                  name="posti_occupati"
                  type="number"
                  value={formData.posti_occupati}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato
              </label>
              <select
                name="stato"
                value={formData.stato}
                onChange={handleChange}
                className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="attivo">Attivo</option>
                <option value="non_disponibile">Non Disponibile</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow hover:shadow-lg hover:translate-y-[-2px] transition-all"
              >
                Salva
              </button>
              <button
                type="button"
                onClick={() => setEditMolo(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 bg-white p-6 border border-blue-100 rounded-xl shadow-md">
        <CreateMolo />
      </div>
    </div>
  );
};

export default MoloTable;
