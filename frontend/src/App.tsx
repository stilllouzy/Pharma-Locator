import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminLayout from "./layouts/AdminLayout"
import PharmacyLayout from "./layouts/PharmacyLayout";
import UserLayout from "./layouts/UserLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/pharmacy/*" element={<PharmacyLayout />} />
        <Route path="/user/*" element={<UserLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;