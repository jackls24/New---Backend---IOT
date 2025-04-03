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
  Home,
  ArrowRight,
  Sparkles,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import BoatTable from "./BoatTable";

const MoloHome = () => {
  const { moloId } = useParams();
  const [dockDetails, setDockDetails] = useState(null);
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "movimento":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "non_disponibile":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium animate-pulse">
            Caricamento molo in corso...
          </p>
        </div>
      </div>
    );

  // Se c'è un errore (ad esempio molo non trovato) lo mostriamo
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-red-50 to-white p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-center text-red-700 mb-2">
            Si è verificato un errore
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            to="/"
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
          >
            Torna alla dashboard
          </Link>
        </div>
      </div>
    );

  if (!dockDetails) return null; // Non dovrebbe accadere se non c'è errore

  const occupancyPercent = Math.round(
    (dockDetails.posti_occupati / dockDetails.capacita) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full">
      {/* Header del Molo */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg w-full">
        <div className="container mx-auto p-6 max-w-full">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-inner mr-4">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{dockDetails.nome}</h1>
                <div className="flex items-center text-blue-100">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{dockDetails.provincia}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  dockDetails.stato
                )} bg-opacity-90`}
              >
                {dockDetails.stato || "Non disponibile"}
              </span>
              <Link
                to="/createmolo"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full font-medium transition-all flex items-center"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Gestisci
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 space-x-1 border-b border-white/20">
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all ${
                activeTab === "overview"
                  ? "bg-white text-blue-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Panoramica
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all ${
                activeTab === "boats"
                  ? "bg-white text-blue-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("boats")}
            >
              Barche
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-full">
        {activeTab === "overview" ? (
          <>
            {/* Sezione overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card Informazioni Principali */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Indirizzo */}
                  <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all transform hover:scale-[1.02] hover:border-blue-300">
                    <div className="flex items-center mb-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white mr-3 shadow-md">
                        <Home className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Indirizzo
                      </h3>
                    </div>
                    <p className="text-gray-600 ml-2 text-lg">
                      {dockDetails.indirizzo || "Indirizzo non specificato"}
                    </p>
                  </div>

                  {/* Capacità */}
                  <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all transform hover:scale-[1.02] hover:border-blue-300">
                    <div className="flex items-center mb-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-lg text-white mr-3 shadow-md">
                        <Anchor className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Capacità
                      </h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-600">
                        <div className="text-lg font-medium">
                          {dockDetails.capacita} posti barca
                        </div>
                        <div className="text-sm text-gray-500">
                          {dockDetails.posti_occupati} occupati ·{" "}
                          {dockDetails.posti_disponibili} disponibili
                        </div>
                      </div>
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-gray-200"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-blue-600"
                            strokeWidth="3"
                            strokeDasharray={100}
                            strokeDashoffset={100 - occupancyPercent}
                            strokeLinecap="round"
                            transform="rotate(-90 18 18)"
                          />
                          <text
                            x="18"
                            y="18"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            className="fill-blue-700 text-xs font-bold"
                          >
                            {occupancyPercent}%
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Barche Recenti */}
                  <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-lg text-white mr-3 shadow-md">
                          <Boat className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Ultime Barche Ormeggiate
                        </h3>
                      </div>
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        onClick={() => setActiveTab("boats")}
                      >
                        Vedi tutte <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>

                    {boats.length > 0 ? (
                      <div className="space-y-3">
                        {boats.slice(0, 3).map((boat) => (
                          <div
                            key={boat.id}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <div
                                className={`p-2 rounded-full bg-gradient-to-br ${
                                  boat.stato === "ormeggiata"
                                    ? "from-green-500 to-emerald-700"
                                    : "from-amber-500 to-orange-700"
                                } text-white mr-3`}
                              >
                                <Boat className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {boat.targa}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <User className="w-3 h-3 mr-1" /> Cliente #
                                  {boat.id_cliente}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                boat.stato === "ormeggiata"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {boat.stato}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
                        <div className="mb-3 inline-flex p-3 bg-gray-100 rounded-full">
                          <Boat className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          Nessuna barca ormeggiata
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dashboard Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl shadow-xl text-white overflow-hidden">
                <div className="p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-bold mb-6 border-b border-white/20 pb-3 flex items-center">
                    <Waves className="mr-2 text-blue-200" />
                    Dashboard Molo
                  </h2>

                  <div className="space-y-6">
                    <div className="relative p-5 bg-white/10 backdrop-blur rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      <div className="relative z-10">
                        <div className="text-xs text-blue-200 uppercase font-semibold mb-1">
                          Stato Operativo
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              dockDetails.stato
                            )}`}
                          >
                            {dockDetails.stato || "Non disponibile"}
                          </span>
                          <div className="p-2 bg-white/20 rounded-full">
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative p-5 bg-white/10 backdrop-blur rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      <div className="relative z-10">
                        <div className="text-xs text-blue-200 uppercase font-semibold mb-1">
                          Capacità di Ormeggio
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="text-lg font-medium">
                              {dockDetails.posti_occupati} /{" "}
                              {dockDetails.capacita}
                            </div>
                            <div className="text-sm text-blue-200">
                              {occupancyPercent}% occupato
                            </div>
                          </div>
                          <div className="w-full bg-blue-900/50 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full transition-all duration-1000"
                              style={{ width: `${occupancyPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative p-5 bg-white/10 backdrop-blur rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      <div className="relative z-10">
                        <div className="text-xs text-blue-200 uppercase font-semibold mb-1">
                          Posti Disponibili
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold">
                            {dockDetails.posti_disponibili}
                          </span>
                          <div className="p-2 bg-white/20 rounded-full">
                            <LayoutGrid className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <button
                      className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all flex items-center justify-center"
                      onClick={() => setActiveTab("boats")}
                    >
                      <Boat className="mr-2 h-4 w-4" />
                      Gestisci Barche
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Sezione barche */
          <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100">
            <div className="flex items-center mb-6 border-b border-blue-100 pb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl text-white shadow-md mr-4">
                <Anchor className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">
                Barche ormeggiate a {dockDetails.nome}
              </h2>
            </div>

            {boats.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="inline-flex justify-center items-center mb-4 p-5 bg-gray-100 rounded-full">
                  <Boat className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Nessuna barca ormeggiata
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Non ci sono barche ormeggiate in questo molo al momento. Le
                  nuove barche che attraccheranno appariranno qui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boats.map((boat) => (
                  <div
                    key={boat.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    <div
                      className={`h-2 bg-gradient-to-r ${
                        boat.stato === "ormeggiata"
                          ? "from-emerald-500 to-green-600"
                          : "from-amber-500 to-orange-600"
                      }`}
                    ></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg ${
                              boat.stato === "ormeggiata"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            } mr-3`}
                          >
                            <Boat className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              Barca #{boat.id}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag className="w-3 h-3 mr-1" /> {boat.targa}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            boat.stato === "ormeggiata"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {boat.stato}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cliente ID:</span>
                          <span className="font-medium text-gray-800">
                            {boat.id_cliente}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Ultimo aggiornamento:
                          </span>
                          <span className="font-medium text-gray-800">
                            {new Date(boat.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full px-4 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium transition-colors flex items-center justify-center">
                          <Sparkles className="w-4 h-4 mr-2" /> Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <BoatTable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoloHome;
