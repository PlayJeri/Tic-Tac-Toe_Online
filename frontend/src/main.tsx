import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

import { WebSocketProvider } from './contextProviders/WebSocketContext'
import { AuthProvider } from './contextProviders/AuthenticationContextProvider'

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </AuthProvider>
)
