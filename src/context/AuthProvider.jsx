import React, { useEffect, useState, useRef, useContext, createContext } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";


const BASE_URL = 'http://192.168.1.202:8080/smartdiet';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return authContext;
};

const AuthProvider = ({ children, initialAuth = null }) => {
  const [auth, setAuth] = useState(initialAuth || { accessToken: null, user: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const alertShownRef = useRef(false);

  // Set token from AsyncStorage on mount (only if no initial auth provided)
  useEffect(() => {
    if (!initialAuth) {
      const loadToken = async () => {
        const storedToken = await AsyncStorage.getItem("accessToken");
        if (storedToken) {
          try {
            const decodedUser = jwtDecode(storedToken);
            setAuth({ accessToken: storedToken, user: decodedUser });
          } catch (e) {
            console.error("Invalid stored token", e);
            await AsyncStorage.removeItem("accessToken");
          }
        }
      };
      loadToken();
    }
  }, [initialAuth]);

  // Attach token to every request
  useEffect(() => {
    const authInterceptor = axios.interceptors.request.use(async (config) => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [auth]);

  // Refresh token logic
  useEffect(() => {
    const refreshInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        if (
          error.response?.status === 401
        ) {
          if (isRefreshing) {
            return Promise.reject(error);
          }
          setIsRefreshing(true);
          originalRequest._retry = true;
          try {
            // call to refresh Refresh token
            const response = await axios.get(`${BASE_URL}/auth/refresh`, {
              withCredentials: true,
            });
            setIsRefreshing(false);
            // Save new access token
            const newAccessToken = response.data.accessToken;
            await AsyncStorage.setItem("accessToken", newAccessToken);
            // Update auth state
            try {
              const decodedUser = jwtDecode(newAccessToken);
              setAuth({ accessToken: newAccessToken, user: decodedUser });
            } catch (e) {
              setAuth({ accessToken: newAccessToken, user: null });
            }
            // Retry failed request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            setIsRefreshing(false);
            console.log("Request refresh token failed: ", refreshError);
            if (!alertShownRef.current) {
              alertShownRef.current = true;
              Alert.alert(
                "Session Expired",
                "This account is offline too long! Please try to login again.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      alertShownRef.current = false;
                      // Optionally, you can clear auth state or navigate to login screen here
                      setAuth({ accessToken: null, user: null });
                      AsyncStorage.removeItem("accessToken");
                    },
                  },
                ]
              );
            }
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(refreshInterceptor);
    };
  }, [isRefreshing]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
