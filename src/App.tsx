import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Overview } from './pages/Overview'
import { EnvironmentsList } from './pages/EnvironmentsList'
import { EnvironmentDetail } from './pages/EnvironmentDetail'
import { ScenarioDetail } from './pages/ScenarioDetail'
import { Train } from './pages/Train'
import { RunsOverview } from './pages/RunsOverview'
import { RunDetail } from './pages/RunDetail'
import { ToolsRegistry } from './pages/ToolsRegistry'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-bg">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/environments" element={<EnvironmentsList />} />
            <Route path="/environments/:id" element={<EnvironmentDetail />} />
            <Route path="/environments/:id/scenarios/:task" element={<ScenarioDetail />} />
            <Route path="/train" element={<Train />} />
            <Route path="/runs" element={<RunsOverview />} />
            <Route path="/runs/:id" element={<RunDetail />} />
            <Route path="/tools" element={<ToolsRegistry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
