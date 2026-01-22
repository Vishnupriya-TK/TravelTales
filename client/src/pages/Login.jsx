import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      addToast('Logged in', 'success');
      navigate("/");
    } catch (err) {
      addToast(err.response?.data?.message || "Login failed", 'error');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mt-8 mx-auto p-6 space-y-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Welcome back</h2>
      <input className="w-full p-3 border rounded" placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
      <input className="w-full p-3 border rounded" type="password" placeholder="Password"
        onChange={e => setForm({...form, password:e.target.value})} />
      <button className="w-full p-3 bg-sky-600 hover:bg-sky-700 text-white rounded transition">Login</button>
    </form>
  );
};

export default Login;
