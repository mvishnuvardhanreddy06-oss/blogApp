import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import AuthorProfile from "./components/AuthorProfile";
import AdminProfile from "./components/AdminProfile";
import AuthorArticles from "./components/AuthorArticles";
import EditArticle from './components/EditArticle'
import WriteArticles from "./components/WriteArticles";
import ArticleByID from "./components/ArticleByID";
import {Toaster} from 'react-hot-toast'
import Unauthorized from './components/Unauthorized'
import ProtectedRoute from "./components/ProtectedRoute";
import UsersList from "./components/UsersList";
import AuthorsList from "./components/AuthorsList";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "user-profile",
          element: (
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "author-profile",
          element: (
            <ProtectedRoute allowedRoles={["AUTHOR"]}>
              <AuthorProfile />
            </ProtectedRoute>
          ),

          children: [
            {
              index: true,
              element: <AuthorArticles />,
            },
            {
              path: "articles",
              element: <AuthorArticles />,
            },
            {
              path: "write-article",
              element: <WriteArticles />,
            },
          ],
        },
        {
          path: "admin-profile",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <UsersList />,
            },
            {
              path: "user-list",
              element: <UsersList />,
            },
            {
              path: "author-list",
              element: <AuthorsList />,
            },
          ],
        },
        {
          path: "article/:id",
          element: <ArticleByID />,
        },
        {
          path: "edit-article",
          element: <EditArticle />,
        },
        {
          path:"unauthorized",
          element:<Unauthorized />
        },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
  <RouterProvider router={routerObj} />
  </div>
);
}

export default App;