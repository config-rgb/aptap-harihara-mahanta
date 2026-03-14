import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Clock, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
    pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    preparing: { label: "Preparing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ready: { label: "Ready", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    served: { label: "Served", color: "bg-primary/20 text-primary border-primary/30" },
};

const FILTERS = ["all", "pending", "preparing", "ready", "served"];

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("admin_token");
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    const fetchOrders = useCallback(async () => {
        try {
            const t = localStorage.getItem("admin_token");
            const params = filter !== "all" ? { status: filter } : {};
            const { data } = await axios.get(`${API}/orders`, { params, headers: { Authorization: `Bearer ${t}` } });
            setOrders(data);
        } catch (e) {
            if (e.response?.status === 401) {
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
            }
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, navigate]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`${API}/orders/${orderId}/status`, { status }, authHeaders);
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            await axios.delete(`${API}/orders/${orderId}`, authHeaders);
            toast.success("Order deleted");
            fetchOrders();
        } catch (e) {
            toast.error("Failed to delete order");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "pending").length,
        preparing: orders.filter(o => o.status === "preparing").length,
        ready: orders.filter(o => o.status === "ready").length,
    };

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Admin Nav */}
            <header className="border-b border-border/30 bg-card" data-testid="admin-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/" className="font-heading text-xl text-primary">aptapcodes</Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link to="/admin/dashboard">
                            <Button variant="ghost" size="sm" className="text-primary font-accent text-xs uppercase tracking-wider" data-testid="nav-dashboard">
                                <LayoutDashboard size={16} className="mr-1" /> <span className="hidden sm:inline">Orders</span>
                            </Button>
                        </Link>
                        <Link to="/admin/menu">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider" data-testid="nav-admin-menu">
                                <UtensilsCrossed size={16} className="mr-1" /> <span className="hidden sm:inline">Menu</span>
                            </Button>
                        </Link>
                        <Link to="/admin/qr-codes">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider" data-testid="nav-qr-codes">
                                <QrCode size={16} className="mr-1" /> <span className="hidden sm:inline">QR</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground/60 hover:text-destructive" data-testid="admin-logout-btn">
                            <LogOut size={16} />
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" data-testid="order-stats">
                    {[
                        { label: "Total Orders", value: stats.total, accent: "text-white" },
                        { label: "Pending", value: stats.pending, accent: "text-yellow-400" },
                        { label: "Preparing", value: stats.preparing, accent: "text-blue-400" },
                        { label: "Ready", value: stats.ready, accent: "text-green-400" },
                    ].map((s, i) => (
                        <div key={i} className="glass-card rounded-md p-4">
                            <div className="font-accent text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                            <div className={`font-heading text-2xl mt-1 ${s.accent}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter + Refresh */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`font-accent text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm whitespace-nowrap ${
                                    filter === f
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                                }`}
                                style={{ transition: "background-color 0.2s, color 0.2s" }}
                                data-testid={`filter-${f}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchOrders} data-testid="refresh-orders-btn">
                        <RefreshCw size={16} className="text-muted-foreground" />
                    </Button>
                </div>

                {/* Orders */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card rounded-md animate-pulse" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground" data-testid="no-orders-msg">
                        No orders found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="bg-card border-l-4 rounded-r-md p-4 sm:p-5"
                                style={{ borderLeftColor: STATUS_MAP[order.status]?.color.includes("yellow") ? "#eab308" : STATUS_MAP[order.status]?.color.includes("blue") ? "#3b82f6" : STATUS_MAP[order.status]?.color.includes("green") ? "#22c55e" : "#D4AF37" }}
                                data-testid={`order-card-${order.id}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-heading text-lg text-white">Table {order.table_number}</span>
                                            <Badge className={STATUS_MAP[order.status]?.color} data-testid={`order-status-${order.id}`}>
                                                {STATUS_MAP[order.status]?.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <Clock size={12} />
                                            <span>{formatTime(order.created_at)}</span>
                                            <span className="font-mono">#{order.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="text-muted-foreground hover:text-destructive p-1"
                                        style={{ transition: "color 0.2s" }}
                                        data-testid={`delete-order-${order.id}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1 mb-3">
                                    {order.items.map((item, j) => (
                                        <div key={j} className="flex justify-between text-sm">
                                            <span className="text-foreground/70">{item.quantity}x {item.name}</span>
                                            <span className="text-foreground/50">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-3 bg-border/20" />

                                <div className="flex items-center justify-between">
                                    <span className="font-accent text-primary font-bold text-lg">${order.total.toFixed(2)}</span>
                                    <Select
                                        value={order.status}
                                        onValueChange={(val) => updateStatus(order.id, val)}
                                    >
                                        <SelectTrigger className="w-36 h-8 bg-secondary/50 border-border/30 text-xs font-accent uppercase tracking-wider" data-testid={`status-select-${order.id}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="preparing">Preparing</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="served">Served</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
