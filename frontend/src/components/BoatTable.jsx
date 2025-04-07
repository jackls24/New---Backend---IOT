import React, { useEffect, useState } from "react";
import Table from "./Table";
import StatusBadge from "./StatusBadge"; // Importiamo il componente StatusBadge
import { getButtonClasses } from "../utils/colorUtils"; // Importiamo l'utility per i bottoni

const BoatTable = () => {
  const [boats, setBoats] = useState([]);
  // Stato per la barca in modifica e per il form
  const [editBoat, setEditBoat] = useState(null);
  const [formData, setFormData] = useState({
    targa: "",
    id_cliente: "",
    stato: "",
    molo_id: "",
    fresh: false,
  });

  useEffect(() => {
    fetch("http://localhost:5001/boats?")
      .then((res) => res.json())
      .then((data) => setBoats(data))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { key: "id", label: "ID", render: (value) => `#${value}` },
    { key: "targa", label: "Targa" },
    { key: "id_cliente", label: "ID Cliente" },
    {
      key: "stato",
      label: "Stato",
      render: (value) => <StatusBadge status={value} />,
    },
    { key: "molo_id", label: "Molo" },
    {
      key: "updated_at",
      label: "Ultimo Aggiornamento",
      render: (value) => new Date(value).toLocaleDateString("it-IT"),
    },
  ];

  // Al click della riga, imposta la barca da modificare e popola il form
  const handleRowClick = (row) => {
    setEditBoat(row);
    setFormData({
      targa: row.targa,
      id_cliente: row.id_cliente,
      stato: row.stato,
      molo_id: row.molo_id,
    });
  };

  // Gestione cambio dei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit per aggiornare la barca
  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5001/boats/${editBoat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, fresh: true }),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((errData) => {
            throw new Error("Errore aggiornamento barca: " + errData.error);
          });
        return res.json();
      })
      .then(() => {
        const updatedBoats = boats.map((b) =>
          b.id === editBoat.id ? { ...b, ...formData } : b
        );
        setBoats(updatedBoats);
        setEditBoat(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Elenco Barche</h1>
      <Table
        columns={columns}
        data={boats}
        onRowClick={handleRowClick}
        pageSize={5}
      />
      {editBoat && (
        <div className="mt-6 p-6 border border-blue-100 rounded-lg bg-blue-50">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            Modifica Barca #{editBoat.id}
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Targa:
                </label>
                <input
                  name="targa"
                  type="text"
                  value={formData.targa}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  ID Cliente:
                </label>
                <input
                  name="id_cliente"
                  type="number"
                  value={formData.id_cliente}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Stato:
                </label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="ormeggiata">Ormeggiata</option>
                  <option value="rubata">Rubata</option>
                  <option value="movimento">movimento</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Molo ID:
                </label>
                <input
                  name="molo_id"
                  type="number"
                  value={formData.molo_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <button
                type="submit"
                className={getButtonClasses("primary", "md")}
              >
                Salva
              </button>
              <button
                type="button"
                onClick={() => setEditBoat(null)}
                className={getButtonClasses("outline", "md")}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BoatTable;
