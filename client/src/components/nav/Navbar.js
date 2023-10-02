import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

/**
 *
 * @returns the navigation bar compoennt
 */
export default function Navbar() {
  // the context
  const [auth, setAuth] = useAuth();
  // hooks
  const navigate = useNavigate();

  useEffect(() => {
    // require authentication when there is no authentication info
    if (!auth) authenticate();
    console.log(auth);
  }, []);

  // send the session cookie to the back end and get the current user
  const authenticate = async () => {
    try {
      // get the use data from the backend with token in the request header
      const { data } = await axios.get("/authenticate");
      // there is a valid user authentication

      if (data.auth) setAuth(true);
    } catch (err) {
      // something wrong
      setAuth(false);
      console.log(err);
    }
  };

  // reset the auth context to empty values
  const logout = async () => {
    // set a request to the server to remove the cookie
    const { data } = await axios.post("/logout");

    // logout success, remove the auth context info
    if (data?.true === "ok") setAuth(false);

    // redirect to the login page
    navigate("/login");
  };

  // display different contents according to the location
  const currentPage = window.location.pathname;

  return (
    <nav className="nav d-flex justify-content-left lead">
      {!auth && currentPage !== "/login" ? (
        <>
          <NavLink className="nav-link" to="/login">
            Login
          </NavLink>
        </>
      ) : (
        ""
      )}
      {!auth && currentPage !== "/register" ? (
        <>
          <NavLink className="nav-link" to="/register">
            Register
          </NavLink>
        </>
      ) : (
        ""
      )}
      {auth ? (
        <>
          <a className="nav-link pointer" onClick={logout}>
            Logout
          </a>
        </>
      ) : (
        ""
      )}
    </nav>
  );
}
