import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { Upload } from "./pages/Upload";
import { Webcam } from "./pages/Webcam";

import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/upload",
      element: <Upload />,
    },
    {
      path: "/webcam",
      element: <Webcam />,
    },
  ]);

  return <RouterProvider router={router} />;
};
