import {  Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import Detection from "./pages/Detection";
export default function App() {
    return (
       
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
         path="/profile"
              element={
            <PrivateRoute>
               <Profile />
             </PrivateRoute>
        }
          />  
              <Route
         path="/detection"
              element={
            <PrivateRoute>
               <Detection />
             </PrivateRoute>
        }
          />  
            </Routes>
        
    );
}
