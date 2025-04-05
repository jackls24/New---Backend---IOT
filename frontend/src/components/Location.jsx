import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useParams, Link } from "react-router-dom";
import Plotter from "../components/Plotter";
import { motion } from "framer-motion";
import {
  Compass,
  Anchor,
  Ship,
  Navigation,
  Clock,
  Map,
  Info,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const Location = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { boatId } = useParams();
  const [notFound, setNotFound] = useState(false);

  // Timer per aggiornare i dati ogni 30 secondi
  useEffect(() => {
    fetchLocationData();
    const timer = setInterval(() => fetchLocationData(), 30000);
    return () => clearInterval(timer);
  }, [boatId]);

  // Fetch data dalla API
  const fetchLocationData = async () => {
    try {
      const boatResponse = await axios.get(
        `http://localhost:5001/boats/${boatId}`
      );

      const boatData = boatResponse.data;

      if (
        !boatData ||
        Object.keys(boatData).length === 0 ||
        boatResponse.status !== 200
      ) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const locationData = {
        name: boatData.targa,
        type: "Barca",
        status: boatData.stato,
        latitude: boatData.latitudine,
        longitude: boatData.longitudine,
        timestamp: boatData.ultima_rilevazione,
        molo_id: boatData.molo_id,
      };

      setLocation(locationData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching boat data:", error);
      setLoading(false);
      setNotFound(true);
      try {
        const fallbackResponse = await axios.get(`/location/${boatId}`);
        setLocation(fallbackResponse.data);
      } catch (fallbackError) {
        console.error("Fallback fetch failed:", fallbackError);
      } finally {
        setLoading(false);
        setNotFound(true);
      }
    }
  };

  // Animazioni
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const coordinatesVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.4 },
    },
  };

  const mapVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.6 },
    },
  };

  if (loading) {
    return (
      <motion.div
        className="w-full h-full flex flex-col justify-center items-center p-6 bg-gradient-to-br from-blue-700 to-blue-900 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mb-4"
        >
          <Compass size={60} className="text-blue-500" />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-white border-t-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-500 mt-4 font-medium"
        >
          Caricamento posizione...
        </motion.p>
      </motion.div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
              <motion.div
                className="mx-auto p-3 bg-white rounded-full shadow-lg inline-flex mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <AlertTriangle size={40} className="text-blue-700" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Barca non trovata
              </h1>
              <p className="text-blue-100">
                Non è stato possibile trovare la barca con ID: {boatId}
              </p>
            </div>

            <div className="p-8">
              <div className="mb-8 text-center">
                <motion.div
                  className="w-full h-48 bg-blue-50 rounded-lg flex items-center justify-center mb-6"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    backgroundSize: ["100% 100%", "120% 120%", "100% 100%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)",
                  }}
                >
                  <Ship size={80} className="text-blue-300" />
                </motion.div>

                <p className="text-gray-600 mb-6">
                  La barca richiesta potrebbe essere stata rimossa o non è mai
                  esistita nel sistema. Verifica l'ID e riprova, o torna alla
                  dashboard per visualizzare le barche disponibili.
                </p>
              </div>

              <div className="flex justify-center">
                <Link to="/">
                  <button className="flex itms-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ArrowLeft className="mr-2" size={18} />
                    Torna alla dashboard
                  </button>
                </Link>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Se ritieni che si tratti di un errore, contatta l'assistenza
                tecnica.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const latitude = location?.latitude || 45.4642;
  const longitude = location?.longitude || 9.19;
  const name = location?.name || "Barca Esempio";
  const type = location?.type || "Yacht";
  const status = location?.status || "In movimento";
  const timestamp = location?.timestamp || new Date().toISOString();
  const formattedDate = new Date(timestamp).toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(timestamp).toLocaleTimeString("it-IT");

  const ZoomAnimation = () => {
    const map = useMap();

    useEffect(() => {
      // Attendi che la mappa sia pronta
      setTimeout(() => {
        // Zoom out e poi zoom in per creare l'effetto
        map.flyTo([latitude, longitude], 8, {
          animate: true,
          duration: 1.5,
        });

        setTimeout(() => {
          map.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.5,
          });
        }, 1500);
      }, 500);
    }, [map]);

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Card */}
        <motion.div
          className="bg-blue-500  rounded-xl shadow-md mb-6 overflow-hidden"
          variants={headerVariants}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex flex-wrap items-center">
            <motion.div
              className="p-3 bg-blue-500  rounded-full shadow-lg mr-5"
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Ship size={36} className="text-blue-700" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{name}</h1>
              <p className="text-blue-100 mt-1 flex items-center">
                <Anchor size={16} className="mr-1" />
                <span>{type}</span>
                <span className="mx-2">•</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-black-900 font-medium ${
                    status === "In movimento"
                      ? "bg-green-100 text-green-800"
                      : status === "Ferma"
                      ? "bg-yellow-100 text-yellow-800"
                      : status === "Rubata"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {status}
                </span>
              </p>
            </div>
            <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col items-end">
              <p className="text-blue-100 text-sm">Ultimo aggiornamento</p>
              <p className="text-white font-bold">{formattedTime}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="bg-white grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Coordinate Card */}
          <motion.div
            className=" rounded-xl shadow-md overflow-hidden md:col-span-1"
            variants={coordinatesVariants}
          >
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 border-b border-blue-600">
              <h2 className="text-xl font-semibold text-blue-500 bg-blue flex items-center">
                <Map className="mr-2" size={22} />
                Coordinate GPS
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <motion.div
                className="flex items-center bg-blue-50 rounded-lg"
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="mr-4 bg-blue-100 rounded-full">
                  <ChevronRight size={20} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-500">Latitudine</p>
                  <p
                    style={{ color: "black" }}
                    className="text-xl font-bold text-blue-900"
                  >
                    {latitude.toFixed(6)}°
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex text-black-900 items-center g-blue-50 rounded-lg"
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                <div className="bg-blue-100 rounded-full">
                  <ChevronRight size={20} className="" />
                </div>
                <div>
                  <p className="text-sm text-blue-500">Longitudine</p>
                  <p
                    style={{ color: "black" }}
                    className="text-xl font-bold text-black-900"
                  >
                    {longitude.toFixed(6)}°
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Data Card */}
          <motion.div
            className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-2"
            variants={cardVariants}
          >
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 border-b border-blue-600">
              <h2 className="text-xl font-semibold text-blue-500 flex items-center">
                <Info className="mr-2" size={20} />
                Dettagli rilevamento
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1 p-2 mb-4">
                  <p className="text-sm text-gray-500">Data rilevamento</p>
                  <div className="flex items-center">
                    <Clock size={18} className="text-blue-600 mr-2" />
                    <p className="text-lg font-medium text-gray-800">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 p-2 mb-4">
                  <p className="text-sm text-gray-500">Ora rilevamento</p>
                  <div className="flex items-center">
                    <Clock size={18} className="text-blue-600 mr-2" />
                    <p className="text-lg font-medium text-gray-800">
                      {formattedTime}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 md:col-span-2 p-2">
                  <p className="text-sm text-gray-500">Stato imbarcazione</p>
                  <div className="flex items-center">
                    <Navigation size={18} className="text-blue-600 mr-2" />
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-black text-sm font-medium text-black`}
                      style={{ color: "black" }}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Card */}
        <motion.div
          className="bg-white rounded-xl shadow-md overflow-hidden"
          variants={mapVariants}
        >
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 border-b border-blue-600">
            <h2 className="text-xl font-semibold text-blue-500 flex items-center">
              <Map className="mr-2" size={20} />
              Mappa di localizzazione
            </h2>
          </div>
          <div className="p-4">
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <MapContainer
                center={[latitude, longitude]}
                zoom={30}
                className="rounded-lg overflow-hidden"
                style={{ height: "500px", width: "100%" }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <ZoomAnimation />

                <Marker position={[latitude, longitude]}>
                  <Popup>
                    <div className="text-center p-2">
                      <h3 className="font-bold text-lg">{name}</h3>
                      <p className="my-1">
                        Posizione registrata:
                        <br />
                        {formattedTime}
                      </p>
                      <p className="text-xs mt-1 text-gray-500">
                        Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right">
            <p className="text-xs text-gray-500">
              Dati aggiornati al: {new Date().toLocaleString()}
            </p>
          </div>
        </motion.div>
      </motion.div>
      <Plotter boatId={boatId} moloId={location?.molo_id}></Plotter>
    </div>
  );
};

export default Location;
