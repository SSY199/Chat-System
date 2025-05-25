import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./Pages/Profile";
import Chat from "./Pages/Chat";
import Auth from "./Pages/Auth";
import { useAppStore } from "./store/store.js";
import apiClient from "./lib/api-client.js";
import { GET_USER_INFO } from "./utils/constants.js";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return !isAuthenticated ? children : <Navigate to="/profile" />;
};

const App = () => {

  const { userInfo, setUserInfo } = useAppStore();
  const [ loading, setLoading ] = useState(true);
  useEffect(() => {
    const getUserDate = async () => {
        try {
          const response = await apiClient.get(GET_USER_INFO, {
            withCredentials: true,
          });
          // console.log("User data fetched successfully:", response.data);
          if(response.status === 200) {
            setUserInfo(response.data.user);
          } else {
            setUserInfo(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        finally {
          setLoading(false);
        }
    }
    if(!userInfo) {
      getUserDate();
    }
    else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);
  if(loading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
