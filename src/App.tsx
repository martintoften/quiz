import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JoinGame } from './components/JoinGame';
import { Lobby } from './components/Lobby';
import { QuizQuestion } from './components/QuizQuestion';
import { WaitingLobby } from './components/WaitingLobby';
import { Results } from './components/Results';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QuizEditor } from './components/admin/QuizEditor';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Routes>
            {/* Player routes */}
            <Route path="/" element={<JoinGame />} />
            <Route path="/game/:gameCode/lobby" element={<Lobby />} />
            <Route path="/game/:gameCode/play" element={<QuizQuestion />} />
            <Route path="/game/:gameCode/waiting" element={<WaitingLobby />} />
            <Route path="/game/:gameCode/results" element={<Results />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/quiz/:quizId"
              element={
                <ProtectedAdminRoute>
                  <QuizEditor />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
