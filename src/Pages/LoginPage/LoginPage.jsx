import React, { useState } from "react";
import { login } from "../../API/authAPI";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "super_admin",

    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Login data sent to server:", form);
        setError("");
        try {
            const res = await login(form);
            const { token, user } = res.data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/overview");
        } catch (err) {
            console.error("Login error", err);
            setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white w-[400px] p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="•••••••••••"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition mt-4"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;