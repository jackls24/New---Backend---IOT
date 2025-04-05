import React, { useState } from "react";
import { PlusCircle, Check, AlertCircle } from "lucide-react";

const CreateMolo = () => {
  const [formData, setFormData] = useState({
    nome: "",
    provincia: "",
    capacita: "",
    posti_occupati: "0",
    indirizzo: "",
    stato: "attivo",
    latitudine: "",
    longitudine: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Crea una copia pulita dei dati da inviare, rimuovendo campi vuoti
    const dataToSend = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== "")
    );

    try {
      const res = await fetch("http://localhost:5001/molo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Errore nella creazione del molo");
      }
      await res.json();
      setSuccess("Molo creato con successo");
      setFormData({
        nome: "",
        provincia: "",
        capacita: "",
        posti_occupati: "0",
        indirizzo: "",
        stato: "attivo",
        latitudine: "",
        longitudine: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="border-t border-blue-100 pt-6">
      <h2 className="text-xl font-bold mb-6 flex items-center text-black">
        <PlusCircle className="mr-2 text-blue-600" />
        Crea Nuovo Molo
      </h2>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome<span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia<span className="text-red-500">*</span>
            </label>
            <input
              name="provincia"
              type="text"
              value={formData.provincia}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
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
            placeholder="Via, numero civico, città"
          />
        </div>

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
              Capacità Totale<span className="text-red-500">*</span>
            </label>
            <input
              name="capacita"
              type="number"
              value={formData.capacita}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white text-black"
          >
            <option value="attivo">Attivo</option>
            <option value="movimento">movimento</option>
            <option value="non_disponibile">Non Disponibile</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow hover:shadow-lg hover:translate-y-[-2px] transition-all flex items-center"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Crea Molo
        </button>
      </form>
    </div>
  );
};

export default CreateMolo;
