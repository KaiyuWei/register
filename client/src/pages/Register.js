import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth.js";

export default function Register() {
  // the hooks for states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // the state indicating the loading status
  const [loading, setLoading] = useState(false);
  // context
  const [auth, setAuth] = useAuth();
  // navigation hook
  const navigate = useNavigate();

  // submission handler
  const handleSubmit = async (e) => {
    try {
      // prevent from auto-reloading ( the default action of submission)
      e.preventDefault();
      // the loading process starts. set the loading state to tru
      setLoading(true);

      // make the post request to the pre-register endpoint
      const { data } = await axios.post(`/pre-register`, {
        firstName,
        lastName,
        email,
        password,
      });

      // we've got the data. the loading process is terminated now
      setLoading(false);

      if (data?.error) {
        // send the user an error toast if there is any error
        toast.error(data.error);
      } else {
        // send the success notification
        toast.success("Please check your email to activate your account!");
        // navigate to login
        navigate("/login");
      }
    } catch (err) {
      // loading process terminated
      setLoading(false);

      console.log(err);
    }
  };

  // for logged in users, navigate to dashboard page
  if (auth) {
    navigate("/dashboard");
    return;
  } else {
    return (
      <div>
        <div className="container d-flex align-items-center justify-content-center">
          <h1 className="display-1 text-secondary p-5">Register</h1>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-lg-4 offset-lg-4">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="First name"
                  className="form-control mb-4"
                  required
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="form-control mb-4"
                  required
                  autoFocus
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Email"
                  className="form-control mb-4"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control mb-4"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  disabled={loading}
                  className="btn btn-primary col-12 mb-4"
                >
                  {loading ? "Waiting..." : "Register"}
                </button>
              </form>
              <Link className="text-link" to="/login">
                Have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
