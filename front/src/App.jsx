import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import PanelEstudiante from './pages/PanelEstudiante'
import PanelDocente from './pages/PanelDocente'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/estudiante" element={<PanelEstudiante />} />
        <Route path="/docente" element={<PanelDocente />} />
      </Routes>
    </BrowserRouter>
  )
}