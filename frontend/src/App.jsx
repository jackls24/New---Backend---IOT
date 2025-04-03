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

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen w-full bg-slate-50">
        <Header />
        <Navbar />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/boat" element={<BoatTable />} />
            <Route path="/createmolo" element={<MoloTable />} />
            <Route path="/molo/:moloId" element={<MoloHome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
