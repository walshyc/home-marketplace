import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explore></Explore>}></Route>
          <Route path='/offers' element={<Offers></Offers>}></Route>
          <Route path='/profile' element={<SignIn></SignIn>}></Route>
          <Route path='/sign-in' element={<SignIn></SignIn>}></Route>
          <Route path='/sign-up' element={<SignUp></SignUp>}></Route>
          <Route path='/forgot-password' element={<ForgotPassword></ForgotPassword>}></Route>
        </Routes>
        <Navbar></Navbar>
      </Router>
    </>
  );
}

export default App;
