import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
    pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    preparing: { label: "Preparing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ready: { label: "Ready", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    served: { label: "Served", color: "bg-primary/20 text-primary border-primary/30" },
};

export default function OrderConfirmationPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`${API}/orders/table/0`);
                const found = data.find(o => o.id === orderId);
                if (found) setOrder(found);
            } catch (e) {
                // Order might not be fetchable without table, try all tables
            }
        };
        fetchOrder();
    }, [orderId]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
                data-testid="order-confirmation"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="text-green-400" size={40} strokeWidth={1.5} />
                </motion.div>

                <h1 className="font-heading text-3xl text-white">Order Confirmed</h1>
                <p className="text-muted-foreground mt-3 text-sm">
                    Your order has been received and is being prepared
                </p>

                <div className="glass-card rounded-md p-6 mt-8 text-left">
                    <div className="flex items-center justify-between">
                        <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Order ID</span>
                        <span className="text-foreground/60 text-xs font-mono" data-testid="order-id">{orderId?.slice(0, 8)}...</span>
                    </div>

                    {order && (
                        <>
                            <Separator className="my-4 bg-border/30" />
                            <div className="flex items-center justify-between">
                                <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Table</span>
                                <span className="text-white font-bold" data-testid="order-table">{order.table_number}</span>
                            </div>
                            <Separator className="my-4 bg-border/30" />
                            <div className="flex items-center justify-between">
                                <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                                <Badge className={STATUS_MAP[order.status]?.color || "bg-secondary"} data-testid="order-status">
                                    {STATUS_MAP[order.status]?.label || order.status}
                                </Badge>
                            </div>
                            <Separator className="my-4 bg-border/30" />
                            <div className="space-y-2">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-foreground/70">{item.name} x{item.quantity}</span>
                                        <span className="text-foreground/70">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4 bg-border/30" />
                            <div className="flex justify-between">
                                <span className="font-accent uppercase tracking-wider text-white text-sm">Total</span>
                                <span className="font-heading text-xl text-primary" data-testid="order-total">
                                    ${order.total.toFixed(2)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Clock size={16} />
                    <span>Estimated preparation time: 15-25 min</span>
                </div>

                <div className="flex gap-3 mt-8 justify-center">
                    <Link to="/menu">
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-accent uppercase tracking-wider text-xs px-6"
                            data-testid="order-again-btn"
                        >
                            Order More <ArrowRight className="ml-2" size={16} />
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button
                            variant="outline"
                            className="border-border hover:bg-secondary rounded-sm font-accent uppercase tracking-wider text-xs px-6"
                            data-testid="go-home-btn"
                        >
                            Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
