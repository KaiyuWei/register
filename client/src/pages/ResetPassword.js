import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  // the state for email input value
  const [password, setPassword] = useState("");
  // the state indicating the loading status
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // get the token
  const { token } = useParams();

  // submit handler
  const handleSubmit = async (e) => {
    // prevent from refreshing the page
    e.preventDefault();

    // send an email to the user by this API
    const { data } = await axios.post("/reset-password", { password, token });

    if (data?.error) {
      console.log(data.error);
      toast.error(data.error);
    } else {
      // indicate success
      toast.success("Password is successfully reset.");
      navigate("/login");
    }
  };

  return (
    <div>
      <h1 className="display-1 d-flex text-secondary align-items-center justify-content-center p-5">
        Reset Password
      </h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 offset-lg-4">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter your new password"
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
                {loading ? "Waiting..." : "Reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
