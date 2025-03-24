import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import HomePage from "./pages/HomePage";
import CreatePlace from "./pages/CreatePlace";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/places/create" element={<CreatePlace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
