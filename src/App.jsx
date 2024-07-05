import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import AddFriend from './pages/AddFriend';

const App = () => {
  return (
    <Router>
      <Routes> 
        <Route path='/signup' element={<SignupPage />}/>
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/' element={<Home />}/>
        <Route path='/add-friend' element={<AddFriend />}/>
      </Routes>
    </Router>
  )
}

export default App