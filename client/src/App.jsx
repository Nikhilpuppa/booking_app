import './App.css'
import {Route, Routes} from "react-router-dom"
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import Layout from './Layout'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import PlacesPages from './pages/PlacesPage'
import PlacesFormPage from './pages/PlacesFormPage'
import ProfilePage from './pages/ProfilePage'
import PlacePage from './pages/PlacePage'
import BookingsPage from './pages/BookingsPage'
import BookingPage from './pages/BookingPage'

// axios.defaults.baseURL = 'http://127.0.0.1:4000'; 
// axios.defaults.withCredentials = true;

// axios.defaults.baseURL = 'http://192.168.49.2:30001'; 
// axios.defaults.withCredentials = true;


axios.defaults.baseURL = window.location.hostname === 'localhost' ? 
  'http://127.0.0.1:4000' : 
  'http://192.168.49.2:30001';


// axios.defaults.withCredentials = true;



function App() {

  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<IndexPage/>}/>    
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/account" element={<ProfilePage/>}/>
        <Route path="/account/places" element={<PlacesPages/>}/>
        <Route path="/account/places/new" element={<PlacesFormPage/>}/>
        <Route path="/account/places/:id" element={<PlacesFormPage/>}/>
        <Route path="/place/:id" element={<PlacePage/>} />
        <Route path="/account/bookings" element={<BookingsPage/>} />
        <Route path="/account/bookings/:id" element={<BookingPage/>} />
        
      </Route>
    </Routes>
    </UserContextProvider>
  )
}

export default App
