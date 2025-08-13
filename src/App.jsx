import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/HomeController'
import { HomeBar } from './components/Homebar'
import Footer from './components/Footer'
import Days from './national-days/NationalDaysController'
import Login from './login/Login'
import { useEffect, useState } from 'react'
import { auth } from './login/Login'
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'
import { db } from './login/Login'
import { Navigate } from 'react-router-dom'
import Profile from './login/Profile'
import Cart from './payment/Cart'
import Success from './payment/Success'
import Cancel from './payment/Cancel'
import Admin from './admin/Admin'
import Members from './members/Members'
import EventsPage from './program/program.jsx'
import ExecCommittee from './exec-comm/exec-comm.jsx'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      try {
        await currentUser.getIdToken(true); // Force token refresh
        const tokenResult = await currentUser.getIdTokenResult();
        const userDocRef = doc(db, 'users-ccoh', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfileComplete(userData.isProfileComplete || false);
        } else {
          setProfileComplete(false);
        }

        setIsAdmin(tokenResult.claims.admin === true);
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsAdmin(false);
      }

      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }
  if (user && profileComplete === null) return <div>Checking profile...</div>;

  const handleProfileComplete = () => {
    setProfileComplete(true); 
  };

  return (
    <div>
      <Router>
        <HomeBar />
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/national-days' element={<Days />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/success' element={<Success />} />
            <Route path='/cancel' element={<Cancel />} />
            <Route path='/members' element={<Members />} />
            <Route path='/program' element={<EventsPage />} />
            <Route path='/exec-comm' element={<ExecCommittee />} />
          
            <Route
              path="/profile"
              element={
                user ? (
                  <Profile onProfileComplete={handleProfileComplete} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route 
              path="/admin"
              element={
                user && isAdmin ? ( // Check if the user is an admin
                  <Admin />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </Router>
      <Footer />
    </div>
  )
}

export default App;