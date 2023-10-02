import { useState } from "react";

export default function ForgotPassword() {
  // the state for email input value
  const [email, setEmail] = useState("");
  // the state indicating the loading status
  const [loading, setLoading] = useState(false);

  // submit handler
  const handleSubmit = () => {};

  return (
    <div>
      <h1 className="display-1 d-flex text-secondary align-items-center justify-content-center p-5">
        Forgot Password
      </h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 offset-lg-4">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter your email"
                className="form-control mb-4"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                disabled={loading}
                className="btn btn-primary col-12 mb-4"
              >
                {loading ? "Waiting..." : "Send email"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
