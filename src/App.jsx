import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'

function App() {
  return (
    <div>
      <Router>
        {/* <Home /> */}
        {/* <HomeBar /> */}
    
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
      
    </div>
  )
}

export default App
