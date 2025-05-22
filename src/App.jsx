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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setProfileComplete(userSnap.data().isProfileComplete || false);
        }
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  if (loading) {
    return <div>Loading...</div>;
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

            

          </Routes>
        </main>
      </Router>
      <Footer />
    </div>
  )
}

export default App
