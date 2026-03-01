import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProductForm from "./pages/ProductForm";
import MarketPage from "./pages/MarketPage";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('campkart-token');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <MarketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
