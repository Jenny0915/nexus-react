import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";

import Library from "../pages/Library.jsx";
import BookDetail from "../pages/BookDetail.jsx";
import Purchases from "../pages/Purchases.jsx";

import Coworking from "../pages/Coworking.jsx";
import CoworkingReservas from "../pages/CoworkingReservas.jsx";
import SpaceDetail from "../pages/SpaceDetail.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Layout general (header + outlet) */}
      <Route element={<AppLayout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas (solo si hay usuario logueado) */}
        <Route element={<ProtectedRoute />}>
          {/* Librería */}
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id" element={<BookDetail />} />
          <Route path="/purchases" element={<Purchases />} />

          {/* Coworking */}
          <Route path="/coworking" element={<Coworking />} />
          <Route path="/coworking/reservas" element={<CoworkingReservas />} />
          <Route path="/coworking/:id" element={<SpaceDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}
