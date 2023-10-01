import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth.js";
import { useNavigate } from "react-router-dom";

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
  const logout = () => {
    setAuth({ user: null, session_id: "" });

    /**
     * @todo post request to remove cookie!!
     */

    // remove the localstorage
    localStorage.removeItem("auth");

    // redirect to the login page
    navigate("/login");
  };

  // a user is logged in?
  const loggedIn = auth.user !== null && auth.session_id !== "";

  const currentPage = window.location.pathname;

  return (
    <nav className="nav d-flex justify-content-left lead">
      {!loggedIn ? (
        currentPage == "/login" ? (
          <>
            <NavLink className="nav-link" to="/Register">
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink className="nav-link" to="/login">
              Login
            </NavLink>
          </>
        )
      ) : (
        <>
          <a className="nav-link pointer" onClick={logout}>
            Logout
          </a>
        </>
      )}
    </nav>
  );
}
