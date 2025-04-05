import React, { useEffect, useState, useRef } from "react";
import {
  Navigation,
  Activity,
  Anchor,
  Map,
  Layers,
  ChevronsUp,
} from "lucide-react";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Importa i CSS di Leaflet

// Fix per le icone di Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Registra il plugin per le annotazioni
Chart.register(annotationPlugin);

const Plotter = ({ boatId }) => {
  // Stati per gestire i dati e l'UI
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(true);

  // Riferimenti per il grafico
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Carica i dati delle coordinate
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        setLoading(true);

        const simulatedCoordinates = [
          { x: 0, y: 0, timestamp: "2025-04-03T09:00:00.000Z" },
          { x: 1, y: 0.5, timestamp: "2025-04-03T09:15:00.000Z" },
          { x: 2.2, y: 1.3, timestamp: "2025-04-03T09:30:00.000Z" },
          { x: 3.5, y: 2.0, timestamp: "2025-04-03T09:45:00.000Z" },
          { x: 4.8, y: 3.0, timestamp: "2025-04-03T10:00:00.000Z" },
          { x: 6.1, y: 4.2, timestamp: "2025-04-03T10:15:00.000Z" },
          { x: 7.3, y: 5.0, timestamp: "2025-04-03T10:30:00.000Z" },
          { x: 8.5, y: 6.1, timestamp: "2025-04-03T10:45:00.000Z" },
          { x: 9.8, y: 7.2, timestamp: "2025-04-03T11:00:00.000Z" },
          { x: 11, y: 8.4, timestamp: "2025-04-03T11:15:00.000Z" },
        ];

        const coordGeo2 = convertToGeographicCoordinates(simulatedCoordinates);

        console.log("Coordinate geografiche:", coordGeo2);

        /* VERSIONE 1 
        const formattedData = simulatedCoordinates.map((point, index) => {
          // Converti le coordinate cartesiane in geografiche
          const coordGeo = convertiCoordinateCartesianeInGeografiche(
            point.x,
            point.y
          );
          return {
            x: point.x, // Manteniamo le coordinate cartesiane originali
            y: point.y,
            geoX: coordGeo.lon, // Aggiungiamo le coordinate geografiche
            geoY: coordGeo.lat,
            timestamp: point.timestamp,
            name: `Punto ${index + 1}`,
          };
        });

        */

        //Versione 2
        const formattedData = coordGeo2.map((point) => {
          return {
            geoX: point.lng,
            geoY: point.lat,
            x: point.x,
            y: point.y,
          };
        });

        setCoordinates(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Errore nel recupero delle coordinate:", err);
        setError("Impossibile caricare i dati delle coordinate");
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [boatId]);

  const convertToGeographicCoordinates = (cartesianCoords) => {
    const origin = {
      lat: 37.512988,
      lng: 15.106013,
    };

    const scale = {
      xToLng: 0.0012636, // longitudine per unità x
      yToLat: 0.0012738, // latitudine per unità y
    };

    return cartesianCoords.map((point) => {
      const lat = origin.lat + point.y * scale.yToLat;
      const lng = origin.lng + point.x * scale.xToLng;
      return {
        ...point,
        lat,
        lng,
      };
    });
  };

  const convertiCoordinateCartesianeInGeografiche = (x, y) => {
    // Il porto è l'origine (0,0) nel sistema cartesiano
    // latPorto e lonPorto sono le coordinate geografiche reali del porto

    // Fattore di conversione: approssimazione della distanza in km per 1 grado
    // 111.32 km per 1 grado di latitudine (costante approssimata)
    // Per la longitudine dipende dalla latitudine: 111.32 * cos(latitudine in radianti)
    const kmPerGradoLat = 111.32;
    const kmPerGradoLon = 111.32 * Math.cos((latPorto * Math.PI) / 180);

    // Assumendo che x e y siano espressi in km
    // Se sono in un'altra unità, aggiusta i fattori di conversione

    // Calcolo della nuova latitudine e longitudine
    const nuovaLat = latPorto + y / kmPerGradoLat;
    const nuovaLon = lonPorto + x / kmPerGradoLon;

    return {
      lat: nuovaLat,
      lon: nuovaLon,
    };
  };

  const latPorto = 37.512988;
  const lonPorto = 15.106013;

  const calcolaPuntoArrivo = (options = {}) => {
    if (coordinates.length < 2) return null;

    // Ottieni gli ultimi due punti per calcolare la direzione attuale
    const ultimoPunto = coordinates[coordinates.length - 1];
    const penultimoPunto = coordinates[coordinates.length - 2];

    // Calcola la direzione in radianti usando le coordinate cartesiane
    const deltaX = ultimoPunto.x - penultimoPunto.x;
    const deltaY = ultimoPunto.y - penultimoPunto.y;
    const direzioneRad = Math.atan2(deltaY, deltaX);
    const direzioneGradi = ((direzioneRad * 180) / Math.PI + 360) % 360;

    // Calcola la velocità in unità cartesiane per ora
    const tempoTrascorsoMs =
      new Date(ultimoPunto.timestamp) - new Date(penultimoPunto.timestamp);
    const tempoTrascorsoOre = tempoTrascorsoMs / (1000 * 60 * 60);
    const velocitaX = deltaX / tempoTrascorsoOre;
    const velocitaY = deltaY / tempoTrascorsoOre;

    // Predici la posizione futura nelle coordinate cartesiane
    const oreDiPrevisione = options.ore || 2; // Default: 2 ore nel futuro
    const nuovaX = ultimoPunto.x + velocitaX * oreDiPrevisione;
    const nuovaY = ultimoPunto.y + velocitaY * oreDiPrevisione;

    // Converti in coordinate geografiche
    const coordGeo = convertiCoordinateCartesianeInGeografiche(nuovaX, nuovaY);

    return {
      x: nuovaX,
      y: nuovaY,
      geoX: coordGeo.lon,
      geoY: coordGeo.lat,
      direzione: direzioneGradi,
      tempoStimato: new Date(
        new Date(ultimoPunto.timestamp).getTime() +
          oreDiPrevisione * 60 * 60 * 1000
      ),
    };
  };

  const puntoArrivo = calcolaPuntoArrivo({ fattoreProiezione: 1 });

  useEffect(() => {
    if (coordinates.length === 0 || !chartRef.current) return;

    // Distruggi il grafico esistente se presente
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const chartData = {
      datasets: [
        {
          label: "Rotta",
          data: coordinates.map((coord) => ({
            x: coord.x,
            y: coord.y,
          })),
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "#1e40af",
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: true,
          tension: 0.2,
          pointStyle: "circle",
        },
        // Dataset per punto iniziale
        {
          label: "Partenza",
          data:
            coordinates.length > 0
              ? [{ x: coordinates[0].x, y: coordinates[0].y }]
              : [],
          backgroundColor: "#10b981",
          borderColor: "#059669",
          pointRadius: 8,
          pointHoverRadius: 10,
          pointStyle: "rectRounded",
        },
        // Dataset per punto finale
        {
          label: "Posizione attuale",
          data:
            coordinates.length > 0
              ? [
                  {
                    x: coordinates[coordinates.length - 1].x,
                    y: coordinates[coordinates.length - 1].y,
                  },
                ]
              : [],
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          pointRadius: 8,
          pointHoverRadius: 10,
          pointStyle: "triangle",
        },
      ],
    };

    if (puntoArrivo) {
      chartData.datasets.push({
        label: "Destinazione stimata",
        data: [{ x: puntoArrivo.x, y: puntoArrivo.y }],
        backgroundColor: "#9333ea", // Viola
        borderColor: "#7e22ce",
        pointRadius: 8,
        pointHoverRadius: 10,
        pointStyle: "star",
      });
    }

    // Aggiungi il punto del porto per riferimento
    chartData.datasets.push({
      label: "Porto",
      data: [{ x: 15.106616683547559, y: 37.514856673524534 }],
      backgroundColor: "#0284c7", // Blu chiaro
      borderColor: "#0369a1",
      pointRadius: 8,
      pointHoverRadius: 10,
      pointStyle: "circle",
    });

    // Aggiungi linea tratteggiata per la rotta futura
    chartData.datasets.push({
      label: "Percorso proiettato",
      data: [
        {
          x: coordinates[coordinates.length - 1].x,
          y: coordinates[coordinates.length - 1].y,
        },
        { x: puntoArrivo.x, y: puntoArrivo.y },
      ],
      backgroundColor: "transparent",
      borderColor: "#9333ea", // Viola
      pointRadius: 0,
      borderDash: [5, 5],
      borderWidth: 2,
      showLine: true,
    });

    // Crea un nuovo grafico
    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Coordinata X",
              font: { weight: "bold" },
            },
            suggestedMin:
              coordinates.length > 0
                ? Math.min(...coordinates.map((c) => c.x)) - 0.02
                : 0,
            suggestedMax:
              coordinates.length > 0
                ? Math.max(...coordinates.map((c) => c.x)) + 0.02
                : 0,
            bounds: "data",
            padding: 20,
          },
          y: {
            title: {
              display: true,
              text: "Coordinata Y",
              font: { weight: "bold" },
            },
            suggestedMin:
              coordinates.length > 0
                ? Math.min(...coordinates.map((c) => c.y)) - 0.02
                : 0,
            suggestedMax:
              coordinates.length > 0
                ? Math.max(...coordinates.map((c) => c.y)) + 0.02
                : 0,
            bounds: "data",
            padding: 20,
          },
        },
        plugins: {
          legend: {
            labels: { usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const point =
                  coordinates[
                    context.datasetIndex === 0
                      ? context.dataIndex
                      : context.datasetIndex === 1
                      ? 0
                      : coordinates.length - 1
                  ];

                const coords = `Posizione: (${point.x.toFixed(
                  4
                )}, ${point.y.toFixed(4)})`;

                if (context.datasetIndex === 1) {
                  return [
                    "Punto di partenza",
                    coords,
                    `Ora: ${new Date(point.timestamp).toLocaleString()}`,
                  ];
                } else if (context.datasetIndex === 2) {
                  return [
                    "Posizione attuale",
                    coords,
                    `Ora: ${new Date(point.timestamp).toLocaleString()}`,
                  ];
                }

                return [
                  coords,
                  `Ora: ${new Date(point.timestamp).toLocaleString()}`,
                ];
              },
            },
            backgroundColor: "rgba(14, 29, 64, 0.85)",
            titleFont: { weight: "bold" },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
          },
          annotation: {
            annotations: {
              line1: {
                type: "line",
                yMin: coordinates.length > 0 ? coordinates[0].y : 0,
                yMax: coordinates.length > 0 ? coordinates[0].y : 0,
                xMin: coordinates.length > 0 ? coordinates[0].x : 0,
                xMax: coordinates.length > 0 ? coordinates[0].x : 0,
                borderColor: "rgba(16, 185, 129, 0.3)",
                borderWidth: 2,
              },
            },
          },
        },
        elements: {
          line: { borderWidth: 3 },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [coordinates, puntoArrivo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
        <div className="rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="text-red-500 mb-4">
          <Activity size={40} className="mx-auto" />
        </div>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  // No data
  if (coordinates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="text-blue-500 mb-4">
          <Navigation size={40} className="mx-auto" />
        </div>
        <p className="text-gray-700">Nessuna coordinata da visualizzare</p>
      </div>
    );
  }

  const portIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const currentIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 border-b border-blue-600">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Anchor className="mr-2 text-white" size={20} />
          Tracciamento Posizione
        </h2>
      </div>

      <div className="p-4">
        {/* Toggle tra i vari tipi di visualizzazione */}
        <div className="mb-4 flex justify-center space-x-4">
          <button
            onClick={() => {
              setShowMap(false);
            }}
            className={`px-4 py-2 rounded-lg flex items-center ${
              !showMap ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Map size={18} className="mr-2" />
            Percorso completo
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              showMap ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Layers size={18} className="mr-2" />
            Mappa
          </button>
        </div>

        {showMap ? (
          <div
            style={{ height: "500px" }}
            className="border border-blue-100 rounded-lg bg-blue-50 p-2"
          >
            <MapContainer
              center={[latPorto, lonPorto]} // Inizia dal porto
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {coordinates.length > 0 && (
                <>
                  <Marker position={[latPorto, lonPorto]} icon={portIcon}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="text-lg font-bold">Porto</h3>
                        <p>Punto di partenza (0,0)</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat: {latPorto.toFixed(6)}°, Long:{" "}
                          {lonPorto.toFixed(6)}°
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker
                    position={[
                      coordinates[coordinates.length - 1].geoY,
                      coordinates[coordinates.length - 1].geoX,
                    ]}
                    icon={currentIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="text-lg font-bold">Posizione attuale</h3>
                        <p>
                          Coordinate cartesiane: (
                          {coordinates[coordinates.length - 1].x.toFixed(2)},{" "}
                          {coordinates[coordinates.length - 1].y.toFixed(2)})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat:{" "}
                          {coordinates[coordinates.length - 1].geoY.toFixed(6)}
                          °, Long:{" "}
                          {coordinates[coordinates.length - 1].geoX.toFixed(6)}°
                        </p>
                        <p>
                          {new Date(
                            coordinates[coordinates.length - 1].timestamp
                          ).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  <Polyline
                    positions={coordinates.map((coord) => [
                      coord.geoY,
                      coord.geoX,
                    ])}
                    color="#1e40af"
                    weight={3}
                  />
                </>
              )}
            </MapContainer>
          </div>
        ) : (
          <div
            style={{ height: "500px" }}
            className="border border-blue-100 rounded-lg bg-blue-50 p-2"
          >
            <canvas ref={chartRef}></canvas>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          Tracciamento di {coordinates.length} punti
          {coordinates[0]?.timestamp && (
            <>
              {" "}
              • Ultimo aggiornamento:{" "}
              <span className="font-medium">
                {new Date(
                  coordinates[coordinates.length - 1]?.timestamp || ""
                ).toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plotter;
