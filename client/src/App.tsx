import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiProvider } from './api/API';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AddReview from './pages/AddReview';
import EditReview from './pages/EditReview';
import ReviewDetail from './pages/ReviewDetail';
import Map from './pages/Map';
import NotFound from './pages/NotFound';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Styles
import './index.css';

const App: React.FC = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/map" element={<Map />} />
                <Route path="/add-review" element={<AddReview />} />
                <Route path="/edit-review/:reviewId" element={<EditReview />} />
                <Route path="/review/:reviewId" element={<ReviewDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;