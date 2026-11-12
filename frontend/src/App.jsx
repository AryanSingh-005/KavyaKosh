import './index.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import AIStudio from './pages/AIStudio/AIStudio';
import PublishPage from './pages/Publish/PublishPage';
import PoemDetailPage from './pages/PoemDetail/PoemDetailPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DiscussionsPage from './pages/Discussions/DiscussionsPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import CompetitionsPage from './pages/Competitions/CompetitionsPage';
import BookDetailPage from './pages/Marketplace/BookDetailPage';
import PremiumPage from './pages/Premium/PremiumPage';
import Login from './pages/Auth/Login';
import AdminPage from './pages/Admin/AdminPage';
import AdminGuard from './components/auth/AdminGuard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PremiumProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/*" element={<AdminGuard><AdminPage /></AdminGuard>} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/ai-studio" element={<AIStudio />} />
                <Route path="/publish" element={<PublishPage />} />
                <Route path="/poems/:id" element={<PoemDetailPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/writers/:username" element={<ProfilePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/discussions" element={<DiscussionsPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/marketplace/books/:id" element={<BookDetailPage />} />
                <Route path="/competitions" element={<CompetitionsPage />} />
                <Route path="/premium" element={<PremiumPage />} />
              </Route>
            </Routes>
          </Router>
        </PremiumProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
