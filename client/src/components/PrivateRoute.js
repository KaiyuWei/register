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

  // the outlet enables the nested UI rendering, which requires authentication.
  return auth ? <Outlet /> : "";
}
