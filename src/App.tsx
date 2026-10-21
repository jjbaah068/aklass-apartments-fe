import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./layout/rootlayout";
import Home from "./pages/home";
import Apartment from "./pages/apartment";
import Contact from "./pages/contact";
import Book from "./pages/book";
import NotFound from "./pages/notfound";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import ReviewsPage from "./pages/reviews";
import LeaveReview from "./pages/leavereview";

const aklassrouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/apartment", element: <Apartment /> },
      { path: "/contact", element: <Contact /> },
      { path: "/reviews", element: <ReviewsPage /> },
      { path: "/reviews/new", element: <LeaveReview /> },
      { path: "/book", element: <Book /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/terms", element: <Terms /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={aklassrouter} />;
}

export default App;