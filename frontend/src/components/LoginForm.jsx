import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/authenticate', { username, password }, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const { token } = response.data;
            localStorage.setItem('token', token);
            login(username, token);
            navigate('/convert');
        } catch (error) {
            console.error(error);
        }
    };

    const redirectToSendMessage = () => {
        navigate('/register');
    };

    return (
        <>
            <div>
                <button onClick={redirectToSendMessage}>Register</button>
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default LoginForm;
