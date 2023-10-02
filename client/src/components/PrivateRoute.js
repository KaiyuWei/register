/**
 * This component protects the pages that should only be accessed in autheticated status
 */

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";
import axios from "axios";

export default function PrivateRoute() {
  // context
  const { auth, setAuth } = useAuth();
  // if we have the user logged in, the state is set to 'true'.

  // the outlet enables the nested UI rendering, which requires authentication.
  return auth ? <Outlet /> : "";
}
