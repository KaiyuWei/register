import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 *
 * @returns the navigation bar compoennt
 */
export default function Navbar() {
  // the context
  const [auth, setAuth] = useAuth();
  // hooks
  const navigate = useNavigate();

  // reset the auth context to empty values
  const logout = async () => {
    // set a request to the server to remove the cookie
    const { data } = await axios.post("/logout");

    // logout success, remove the auth context info
    if (data?.true === "ok") setAuth({ user: null, session_id: "" });

    // redirect to the login page
    navigate("/login");
  };

  // a user is logged in?
  const loggedIn = auth.user !== null && auth.session_id !== "";

  const currentPage = window.location.pathname;

  return (
    <nav className="nav d-flex justify-content-left lead">
      {!loggedIn && currentPage !== "/login" ? (
        <>
          <NavLink className="nav-link" to="/login">
            Login
          </NavLink>
        </>
      ) : (
        ""
      )}
      {!loggedIn && currentPage !== "/register" ? (
        <>
          <NavLink className="nav-link" to="/register">
            Register
          </NavLink>
        </>
      ) : (
        ""
      )}
      {loggedIn ? (
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
