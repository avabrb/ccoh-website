import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/HomeController'
import { HomeBar } from './components/Homebar'

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
      

      
    </div>
  )
}

export default App
