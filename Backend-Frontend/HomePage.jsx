import React from "react";
import { Ship, Anchor, Plus, Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom"; // Importa il componente Link

const HomePage = () => {
  return (
    <div className="min-h-screen bg-blue-600 mb-24 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Logo e Titolo */}
        <div className="text-center mb-12">
          {" "}
          {/* Ridotto il margine inferiore */}
          <h1 className="text-3xl mb-4 font-bold text-white">
            Porto Manager
          </h1>{" "}
          {/* Ridotto anche il margine del titolo */}
        </div>

        {/* Menu principale */}
        <div className="flex items-stretch  flex items-center justify-between space-y-4 flex-col mb-6">
          {/* Crea Molo */}

          <Link to="/createmolo">
            <button className="bg-white w-full rounded-xl p-5 shadow-lg flex items-center transition-all hover:translate-x-2 hover:shadow-xl">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Plus size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-800">Crea Molo</h2>
                <p className="text-gray-500">Aggiungi un nuovo molo</p>
              </div>
            </button>
          </Link>

          {/* Modifica Barca */}
          <Link to="/boat">
            <button className="bg-white m-24 w-full rounded-xl p-5 shadow-lg flex items-center transition-all hover:translate-x-2 hover:shadow-xl">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Edit size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-800">
                  Modifica Barca
                </h2>
                <p className="text-gray-500">Aggiorna i dettagli della barca</p>
              </div>
            </button>
          </Link>

          {/* Visualizza Barca */}
          <Link to="/boat">
            <button className="bg-white  rounded-xl p-5 shadow-lg flex items-center transition-all hover:translate-x-2 hover:shadow-xl">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Eye size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-800">
                  Visualizza Barca
                </h2>
                <p className="text-gray-500">Controlla lo stato delle barche</p>
              </div>
            </button>
          </Link>

          {/* Gestione Flotta */}
          <Link to="/visualizza-barca">
            <button className="bg-white   w-full rounded-xl p-5 shadow-lg flex items-center transition-all hover:translate-x-2 hover:shadow-xl">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Ship size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-800">Flotta</h2>
                <p className="text-gray-500">Gestisci tutte le barche</p>
              </div>
            </button>
          </Link>
        </div>

        {/* Statistiche minime */}
        <div className="flex justify-between bg-blue-700 rounded-xl p-4 text-white">
          <div className="text-center">
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs uppercase tracking-wide">Barche</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs uppercase tracking-wide">Moli</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">75%</p>
            <p className="text-xs uppercase tracking-wide">Occupato</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
