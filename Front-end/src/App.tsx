import Navbar from './Pages/Navbar';
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassoword from './Pages/ForgotPassword';
import GuestHomePage from './Pages/GuestHomePage';
import GraphsPage from './Pages/GraphsPage';
import AccountPage from './Pages/AccountPage';
import HomePage from './Pages/HomePage';

function App() {
  return (
    <>
      <Routes>
        <Route path = "/Login" element={<Login/>}></Route>
        <Route path = "/Register" element={<Register/>}></Route>
        <Route path = "/ForgotPassword" element={<ForgotPassoword/>}></Route>
        <Route path="/" element={<GuestHomePage/>}></Route>
        <Route path="/Home" element={<HomePage/>}></Route>
        <Route path = "/Navbar" element={<Navbar/>}></Route>
        <Route path = "/GraphsPage" element={<GraphsPage/>}></Route>
        <Route path = "/AccountPage" element={<AccountPage/>}></Route>
      </Routes>
    </>
  )
}

export default App
