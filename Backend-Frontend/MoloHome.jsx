import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Ship as Boat,
  Anchor,
  ShieldCheck,
  Waves,
  LayoutGrid,
  MapPin,
  Ruler,
  AlertTriangle,
} from "lucide-react";
import BoatTable from "./BoatTable";

const MoloHome = () => {
  const { moloId } = useParams();
  const [dockDetails, setDockDetails] = useState(null);
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch dettagli del molo
    const fetchDockDetails = fetch(`http://localhost:5001/molo/${moloId}`);
    // Fetch delle barche nel molo
    const fetchBoats = fetch(`http://localhost:5001/boats?molo_id=${moloId}`);

    Promise.all([fetchDockDetails, fetchBoats])
      .then(async ([dockRes, boatsRes]) => {
        const dockData = await dockRes.json();
        // Se il backend restituisce un errore, lancia un'eccezione
        if (dockData.error) {
          throw new Error(dockData.error);
        }
        const boatsData = await boatsRes.json();

        setDockDetails(dockData);
        setBoats(boatsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [moloId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "attivo":
        return "bg-green-100 text-green-800";
      case "movimento":
        return "bg-yellow-100 text-yellow-800";
      case "non_disponibile":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );

  // Se c'è un errore (ad esempio molo non trovato) lo mostriamo
  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="mx-auto mb-4" size={48} />
        <p>{error}</p>
      </div>
    );

  if (!dockDetails) return null; // Non dovrebbe accadere se non c'è errore

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sezione Dettagli Molo */}
        <div className="bg-blue-500 shadow-lg rounded-lg p-6 md:col-span-2 mb-8">
          <div className="flex items-center mb-6">
            <MapPin className="mr-3 text-blue-500 mt-6" size={40} />
            <h1 className="text-3xl font-bold"> {dockDetails.nome}</h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="mr-2 text-gray-600" />
              <span>
                Provincia: {dockDetails.provincia || "Non specificata"}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 text-gray-600" />
              <span>
                Indirizzo: {dockDetails.indirizzo || "Non specificato"}
              </span>
            </div>

            <div className="flex items-center mt-2">
              <ShieldCheck className="mr-2 text-gray-600" />
              <span>Stato: </span>
              <span
                className={`ml-1 px-2 py-1 rounded ${getStatusColor(
                  dockDetails.stato ?? "non_disponibile"
                )}`}
              >
                {dockDetails.stato || "Non disponibile"}
              </span>
            </div>

            <div className="flex items-center mt-2">
              <Boat className="mr-2 text-gray-600" />
              <span>Capacità: {dockDetails.capacita} </span>
            </div>

            <div className="flex items-center mt-2">
              <LayoutGrid className="mr-2 text-gray-600" />
              <span>
                Posti occupati: {boats.length} / {dockDetails.capacita}
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link
              to="/createmolo"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Modifica Molo
            </Link>
          </div>
        </div>

        {/* Sezione Statistiche Veloci */}
        <div className="bg-blue-500 mt-6 shadow-lg rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Waves className="mr-2 text-blue-500" />
            Statistiche Molo
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Barche ormeggiate:</span>
              <span className="font-bold text-blue-600">{boats.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Barche ormeggiabili:</span>
              <span className="font-bold text-green-600">
                {dockDetails.capacita - boats.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Stato occupazione:</span>
              <span className="font-bold">
                {Math.round((boats.length / dockDetails.capacita) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Barche */}
      <div className="bg-blue-500 mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Anchor className="mr-2 text-blue-500" />
          Barche ormeggiate
        </h2>
        {boats.length === 0 ? (
          <p className="text-gray-500">
            Nessuna barca ormeggiata in questo momento.
          </p>
        ) : (
          <div className="grid border-red-100 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boats.map((boat) => (
              <div
                key={boat.id}
                className={`border border-red-100 rounded-lg p-4 hover:shadow-md transition ${
                  boat.stato === "rubato" ? "border-red-100" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Barca #{boat.id}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      boat.stato === "ormeggiata"
                        ? "bg-green-100 text-green-800"
                        : boat.stato === "rubato"
                        ? "bg-red-100 text-red-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {boat.stato}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>Targa: {boat.targa}</p>
                  <p>Cliente ID: {boat.id_cliente}</p>
                  <p>
                    Ultimo Aggiornamento:{" "}
                    {new Date(boat.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <BoatTable />
      </div>
    </div>
  );
};

export default MoloHome;
