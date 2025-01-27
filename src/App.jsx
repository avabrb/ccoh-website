import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/HomeController'
import { HomeBar } from './components/Homebar'
import Footer from './components/Footer'
import NationalDays from './national-days/NationalDaysController'

function App() {
  return (
    <div>
      <Router>
        <HomeBar />
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/national-days' element={<NationalDays />} />
          </Routes>
        </main>
      </Router>
      <Footer />
    </div>
  )
}

export default App
