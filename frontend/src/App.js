import './App.css';
import {AuthProvider} from "./components/AuthContext";
import {Navigate, Route, BrowserRouter as Router, Routes} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VideoUploadForm from "./components/VideoUploadForm";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm/>}/>
                    <Route path="/register" element={<RegisterForm/>}/>
                    <Route path="/convert" element={<VideoUploadForm/>}/>
                    <Route path="*" element={<Navigate to={"/login"} replace/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
