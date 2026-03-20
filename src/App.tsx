/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scripts from './pages/Scripts';
import Executors from './pages/Executors';
import AdminPanel from './pages/AdminPanel';
import Account from './pages/Account';
import Profile from './pages/Profile';
import GetKey from './pages/GetKey';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scripts" element={<Scripts />} />
              <Route path="/executors" element={<Executors />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/account" element={<Account />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/getkey" element={<GetKey />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
