import { useAuth } from "../context/auth";

export default function Login() {
  const [auth, setAuth] = useAuth();
  return (
    <div>
      <h1>Login</h1>
      <pre>{JSON.stringify(auth, null, 4)}</pre>
    </div>
  );
}
