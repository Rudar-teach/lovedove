import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Games from './pages/Games';
import Friends from './pages/Friends';
import Birthday from './pages/Birthday';
import Stats from './pages/Stats';
import BirthdayDetail from './pages/BirthdayDetail';
import TicTacToe from './pages/games/TicTacToe';
import MemoryMatch from './pages/games/MemoryMatch';
import CoupleQuiz from './pages/games/CoupleQuiz';
import WouldYouRather from './pages/games/WouldYouRather';
import WordChain from './pages/games/WordChain';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="games" element={<Games />} />
            <Route path="friends" element={<Friends />} />
            <Route path="birthday" element={<Birthday />} />
            <Route path="birthday/:id" element={<BirthdayDetail />} />
            <Route path="stats" element={<Stats />} />

            {/* Games */}
            <Route path="games/tictactoe" element={<TicTacToe />} />
            <Route path="games/memory" element={<MemoryMatch />} />
            <Route path="games/quiz" element={<CoupleQuiz />} />
            <Route path="games/would-your-rather" element={<WouldYouRather />} />
            <Route path="games/word-chain" element={<WordChain />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
