/**
 * This file provides the context of the authentication status of a user
 */
import { useState, createContext, useContext } from "react";
import axios from "axios";
import { SERVER_API } from "../config.js";

// config axios
axios.defaults.baseURL = SERVER_API;
// enable cookie receiving
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);

  // provide the context to all the children components
  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// used for accessing the state 'auth'
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
