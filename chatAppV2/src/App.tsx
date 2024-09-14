import "./App.css";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import Login from "./components/auth/login";
import SignUp from "./components/auth/signup";
import Welcome from "./components/welcome";
import Dashboard from "./components/shells/dashboard";
import KeyPage from "./components/e2e/keyPage";
import ChatShell from "./components/shells/chatShell";

//const analytics = getAnalytics(app);

function App() {
    //const [count, setCount] = useState(0)

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/key-page" element={<KeyPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/priv/:chatID" element={<ChatShell />} />
            </>
        )
    );

    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;
