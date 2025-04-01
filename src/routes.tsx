import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import HomePage from "./pages/HomePage";
import CreatePlace from "./pages/CreatePlace";
import MyPlaces from "./pages/MyPlaces";
import PendingRequests from "./pages/PendingRequests";
import MyRents from "./pages/MyRents";
import PlaceDetails from "./pages/PlaceDetails";
import UserProfile from "./pages/UserProfile";
import RequestRentPage from "./pages/RequestRentPage";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/places/create" element={<CreatePlace />} />
      <Route path="/meus-espacos" element={<MyPlaces />} />
      <Route path="/solicitacoes" element={<PendingRequests />} />
      <Route path="/rents" element={<MyRents />} />
      <Route path="/place/:id" element={<PlaceDetails />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/request/:id" element={<RequestRentPage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
