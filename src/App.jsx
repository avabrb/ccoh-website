import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/HomeController'
import { HomeBar } from './components/Homebar'
import Footer from './components/Footer'

function App() {
  return (
    <div>
      <Router>
      <HomeBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
      
      <Footer />
      
    </div>
  )
}

export default App
