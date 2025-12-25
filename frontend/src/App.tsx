import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AllExercises from "./pages/AllExercises";
import { AuthProvider } from "@/context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import BicepCurlCounter from "./components/BicepCurlCounter";
import UniversalExerciseCounter from "./components/UniversalExerciseCounter";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <script src="jquery.min.js"></script>
      {/* <script src="imagemapster.js"></script> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/all-exercises" element={<AllExercises />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exercise/:id" element={<UniversalExerciseCounter />} />
        <Route path="/bicep-curls" element={<BicepCurlCounter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
