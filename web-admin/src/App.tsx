import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/Dashboard/DashboardPage'
import AudienciasPage from './pages/Audiencias/AudienciasPage'
import NovaAudienciaPage from './pages/Audiencias/NovaAudienciaPage'
import DetalheAudienciaPage from './pages/Audiencias/DetalheAudienciaPage'
import RBACPage from './pages/RBAC/RBACPage'
import UploadPage from './pages/Upload/UploadPage'
import AuditoriaPage from './pages/Auditoria/AuditoriaPage'
import NotifConfigPage from './pages/Notificacoes/NotifConfigPage'
import NotifHistoricoPage from './pages/Notificacoes/NotifHistoricoPage'
import EvidenciasPage from './pages/Evidencias/EvidenciasPage'
import ApiDocsPage from './pages/ApiDocs/ApiDocsPage'
import ExportacaoPage from './pages/Exportacao/ExportacaoPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"           element={<DashboardPage />} />
        <Route path="/audiencias"          element={<AudienciasPage />} />
        <Route path="/audiencias/nova"     element={<NovaAudienciaPage />} />
        <Route path="/audiencias/:id"      element={<DetalheAudienciaPage />} />
        <Route path="/rbac"                element={<RBACPage />} />
        <Route path="/upload"              element={<UploadPage />} />
        <Route path="/auditoria"           element={<AuditoriaPage />} />
        <Route path="/notificacoes/config" element={<NotifConfigPage />} />
        <Route path="/notificacoes"        element={<NotifHistoricoPage />} />
        <Route path="/evidencias"          element={<EvidenciasPage />} />
        <Route path="/api-docs"            element={<ApiDocsPage />} />
        <Route path="/exportacao"          element={<ExportacaoPage />} />
      </Route>
    </Routes>
  )
}
