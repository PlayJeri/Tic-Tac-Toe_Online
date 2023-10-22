import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Complete } from "./containers/Complete"
import { HomePage } from "./containers/HomePage"
import { RegisterPage } from './containers/Register'
import { ProfilePage } from './containers/ProfilePage'
import 'bootstrap/dist/css/bootstrap.min.css'

import { useAuthContext } from './contextProviders/AuthenticationContextProvider'

const App: React.FC = () => {
  console.log("user is logged in",useAuthContext()?.isLoggedIn);

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
