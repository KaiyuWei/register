/**
 * this file sends a post request to 'api/register/' with user
 * data for registering a user and store the user in the database
 */

import { useEffect } from "react";
import { useNavigate, useParams, useNavigation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/auth.js";

export default function AccountActivate() {
  // we need the global auth context
  const [auth, setAuth] = useAuth();

  // get the token from the params in the routing URL
  const { token } = useParams();

  // the navigator
  const navigate = useNavigate();

  // send the token to the backend after on rendering
  useEffect(() => {
    // call the function that sends the token
    if (token) requestActivation();
  }, []);

  const requestActivation = async () => {
    try {
      // get the response from the server
      const { data } = await axios.post(`/register`, { token });

      // if error received
      if (data?.error) {
        toast.error(data.error);
      } else {
        // set the global auth data
        setAuth(data.auth);
        // send a success toast
        toast.success("Registration success! Welcome to Realist!");
        // navigate to a new page
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Try again");
    }
  };

  return (
    <div
      className="display-1 text-secondary d-flex justify-content-center align-items-center vh-100"
      style={{ marginTop: "-5%" }}
    >
      Please Wait...
    </div>
  );
}
