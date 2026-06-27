import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from './Components/Layout';
import Overview from './Pages/Overview/Overview';
import Pending from "./Pages/Pending/Pending";
import ReviewApplication from './Pages/ReviewApplication/ReviewApplication';
import Services from './Pages/Services/Services';
import Providers from './Pages/Providers/Providers';
import CategoryDetails from './Pages/CategoryDetails/CategoryDetails';
import ProviderProfile from './Pages/ProviderProfile/ProviderProfile';
import Finance from './Pages/Finance/Finance';
import Plans from './Pages/Plans/Plans';
import LoginPage from './Pages/LoginPage/LoginPage';
import './tailwind.css';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./Components/ProtectedRoute";

let router = createBrowserRouter([

  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/login" />
      },
      { path: "overview", element: <Overview /> },
      { path: "pending", element: <Pending /> },
      { path: "pending/:id", element: <ReviewApplication /> },
      { path: "services", element: <Services /> },
      { path: "providers", element: <Providers /> },
      { path: "category/:categoryType", element: <CategoryDetails /> },
      { path: "category/:categoryType/:providerId", element: <ProviderProfile /> },
      { path: "finance", element: <Finance /> },
      { path: "plans", element: <Plans /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <ToastContainer position="top-right" />
    <RouterProvider router={router} />
  </>
);