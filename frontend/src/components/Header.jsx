import React, { useState } from "react";
import { Home, User, Settings, Menu } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative w-full">
        {/* Logo e Titolo */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            LS
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Logo Sito</h1>
        </div>

        {/* Navbar Desktop */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Profilo</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Impostazioni</span>
          </a>
        </nav>

        {/* Bottoni Azioni */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors">
            Registrati
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Accedi
          </button>
        </div>

        {/* Hamburger Menu Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden">
            <nav className="flex flex-col p-4 space-y-3">
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <User className="w-5 h-5" />
                <span>Profilo</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Settings className="w-5 h-5" />
                <span>Impostazioni</span>
              </a>
              <div className="flex flex-col space-y-2 pt-2">
                <button className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-md">
                  Registrati
                </button>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md">
                  Accedi
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
