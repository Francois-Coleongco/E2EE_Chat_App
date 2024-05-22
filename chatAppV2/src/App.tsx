import './App.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Login from './components/login';
import SignUp from './components/signup';
import Welcome from './components/welcome';
import Dashboard from './components/dashboard';

//const analytics = getAnalytics(app);

function App() {
  //const [count, setCount] = useState(0)

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </>
    )
  )


  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
