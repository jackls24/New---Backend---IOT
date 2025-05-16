import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Login, Register } from "./components/Login";
import BoatTable from "./components/BoatTable";
import CreateMolo from "./components/CreateMolo";
import MoloTable from "./components/MoloTable";
import MoloHome from "./components/MoloHome";
import HomePage from "./components/HomePage";
import Location from "./components/Location";
import Plotter from "./components/Plotter";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boat" element={<BoatTable />} />
        <Route path="/createmolo" element={<MoloTable />} />
        <Route path="/molo/:moloId" element={<MoloHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/location/:boatId" element={<Location />} />
        <Route path="/plotter/:boatId" element={<Plotter boatId={1} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
