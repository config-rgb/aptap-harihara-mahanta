import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!password) {
            toast.error("Please enter the admin password");
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/admin/login`, { password });
            localStorage.setItem("admin_token", data.token);
            toast.success("Welcome back!");
            navigate("/admin/dashboard");
        } catch (e) {
            toast.error("Invalid password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm" style={{ transition: "color 0.2s" }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="glass-card rounded-md p-8">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-primary" size={24} strokeWidth={1.5} />
                    </div>
                    <h1 className="font-heading text-2xl text-white text-center">Admin Access</h1>
                    <p className="text-muted-foreground text-center mt-2 text-sm">Enter the admin password to continue</p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-4">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-secondary/50 border-transparent focus:border-primary h-12"
                            data-testid="admin-password-input"
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm py-5 font-accent uppercase tracking-wider text-sm"
                            data-testid="admin-login-btn"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <p className="text-muted-foreground/50 text-xs text-center mt-6">Default password: admin123</p>
                </div>
            </motion.div>
        </div>
    );
}
