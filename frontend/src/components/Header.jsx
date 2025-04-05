import React, { useState, useEffect } from "react";
import { Anchor, MapPin, Ship, Menu, X, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Gestione dello scroll per effetto sticky
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg w-full transition-all duration-300 ${
        scrolled ? "py-1 shadow-xl" : "py-3"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center relative w-full">
        {/* Logo e Titolo */}
        <motion.div
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-blue-600 shadow-md overflow-hidden"
            animate={{}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Ship className="w-10 h-10" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
          <div>
            <motion.h1
              className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 text-transparent bg-clip-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              BoatGuard
            </motion.h1>
            <motion.p
              className="text-xs text-blue-100 -mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              Monitoraggio Imbarcazioni
            </motion.p>
          </div>
        </motion.div>

        {/* Navbar Desktop */}
        <nav className="hidden md:flex space-x-4">
          {[
            {
              href: "/boat",
              icon: <Ship className="w-5 h-5" />,
              label: "Barche",
            },
            {
              href: "/",
              icon: <Anchor className="w-5 h-5" />,
              label: "Il mio Molo",
            },
            {
              href: "/createmolo",
              icon: <MapPin className="w-5 h-5" />,
              label: "Moli",
            },
          ].map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-2 text-blue-100 hover:text-white transition-all group relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                {item.icon}
              </motion.div>
              <span className="border-b-2 border-transparent group-hover:border-white pb-1 transition-all">
                {item.label}
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-white"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </nav>

        {/* Bottoni Azioni */}
        <div className="hidden md:flex items-center space-x-3">
          <motion.button
            className="px-4 py-2 text-white rounded-md border border-white/40 hover:bg-white/10 transition-colors flex items-center overflow-hidden relative"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ x: [-20, 0], opacity: [0, 1] }}
              transition={{ duration: 0.3 }}
            >
              <LogIn className="w-4 h-4 mr-2" />
            </motion.div>
            <span>Accedi</span>
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ zIndex: -1 }}
            />
          </motion.button>

          <motion.button
            className="px-4 py-2 bg-white text-blue-700 font-medium rounded-md hover:bg-blue-50 shadow-md transition-all hover:shadow-lg relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="relative z-10">Registrati</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-white"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ zIndex: 1 }}
            />
          </motion.button>
        </div>

        {/* Hamburger Menu Mobile */}
        <motion.div className="md:hidden" whileTap={{ scale: 0.9 }}>
          <motion.button
            onClick={toggleMenu}
            className="text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors"
            aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="absolute top-full left-0 w-full bg-white shadow-xl md:hidden z-50 rounded-b-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <nav className="flex flex-col p-4 space-y-2">
                {[
                  {
                    href: "/barche",
                    icon: <Ship className="w-6 h-6" />,
                    label: "Barche",
                  },
                  {
                    href: "/mio-molo",
                    icon: <Anchor className="w-6 h-6" />,
                    label: "Il mio Molo",
                  },
                  {
                    href: "/moli",
                    icon: <MapPin className="w-6 h-6" />,
                    label: "Moli",
                  },
                ].map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-800 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.03, x: 5 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}

                <motion.div
                  className="flex flex-col space-y-2 pt-3 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <motion.button
                    className="w-full px-4 py-3 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 font-medium flex items-center justify-center"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Accedi
                  </motion.button>
                  <motion.button
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Registrati
                  </motion.button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative wave animated */}
      <div className="relative overflow-hidden h-2">
        <motion.div
          className="absolute w-full h-full bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 opacity-40"
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%"],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.header>
  );
};

export default Header;
