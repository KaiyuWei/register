/**
 * This file provides the context of the authentication status of a user
 */
import { useState, createContext, useContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    session_id: "",
  });

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
