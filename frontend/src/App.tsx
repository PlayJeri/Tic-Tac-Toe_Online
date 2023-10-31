import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Complete } from "./containers/Complete"
import { HomePage } from "./containers/HomePage"
import { RegisterPage } from './containers/Register'
import { ProfilePage } from './containers/ProfilePage'
import 'bootstrap/dist/css/bootstrap.min.css'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/game' element={<Complete />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Routes>
    </Router>
  )
}

export default App
