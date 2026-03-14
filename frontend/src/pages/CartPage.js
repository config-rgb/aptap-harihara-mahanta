import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
    const navigate = useNavigate();
    const { items, tableNumber, total, updateQuantity, removeItem, clearCart, setTable } = useCart();
    const [placing, setPlacing] = useState(false);
    const [localTable, setLocalTable] = useState(tableNumber || "");

    const handlePlaceOrder = async () => {
        const tbl = tableNumber || parseInt(localTable);
        if (!tbl || tbl < 1 || tbl > 10) {
            toast.error("Please enter a valid table number (1-10)");
            return;
        }
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        setPlacing(true);
        try {
            if (!tableNumber) setTable(tbl);
            const { data } = await axios.post(`${API}/orders`, {
                table_number: tbl,
                items: items.map(i => ({
                    menu_item_id: i.menu_item_id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image_url: i.image_url || "",
                })),
                total,
            });
            clearCart();
            toast.success("Order placed successfully!");
            navigate(`/order-confirmation/${data.id}`);
        } catch (e) {
            toast.error("Failed to place order. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass" data-testid="cart-header">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link to="/menu" data-testid="back-to-menu">
                        <ArrowLeft className="text-foreground/70 hover:text-primary" size={20} style={{ transition: "color 0.2s" }} />
                    </Link>
                    <h1 className="font-heading text-xl text-white">Your Cart</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                        data-testid="empty-cart"
                    >
                        <ShoppingCart className="mx-auto text-muted-foreground mb-4" size={48} strokeWidth={1} />
                        <h2 className="font-heading text-2xl text-white">Your cart is empty</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Browse our menu and add some delicious items</p>
                        <Link to="/menu">
                            <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-accent uppercase tracking-wider" data-testid="browse-menu-btn">
                                Browse Menu
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Table Number */}
                        {!tableNumber && (
                            <div className="glass-card rounded-md p-4 mb-6" data-testid="table-input-section">
                                <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Table Number</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="Enter your table number (1-10)"
                                    value={localTable}
                                    onChange={(e) => setLocalTable(e.target.value)}
                                    className="mt-2 bg-secondary/50 border-transparent focus:border-primary"
                                    data-testid="table-number-input"
                                />
                            </div>
                        )}

                        {tableNumber && (
                            <div className="mb-6 flex items-center gap-2">
                                <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Table</span>
                                <span className="bg-primary/20 text-primary px-3 py-1 rounded-sm font-accent text-sm font-bold" data-testid="cart-table-number">
                                    {tableNumber}
                                </span>
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.menu_item_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card border border-border/40 rounded-md p-4 flex gap-4"
                                    data-testid={`cart-item-${item.menu_item_id}`}
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-heading text-sm text-white">{item.name}</h3>
                                            <button
                                                onClick={() => removeItem(item.menu_item_id)}
                                                className="text-muted-foreground hover:text-destructive p-1"
                                                style={{ transition: "color 0.2s" }}
                                                data-testid={`remove-item-${item.menu_item_id}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
                                                    style={{ transition: "background-color 0.2s, color 0.2s" }}
                                                    data-testid={`cart-decrease-${item.menu_item_id}`}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-white" data-testid={`cart-qty-${item.menu_item_id}`}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80"
                                                    style={{ transition: "background-color 0.2s" }}
                                                    data-testid={`cart-increase-${item.menu_item_id}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="font-accent text-primary font-bold text-base">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="mt-8 glass-card rounded-md p-6" data-testid="order-summary">
                            <h3 className="font-accent text-sm uppercase tracking-wider text-muted-foreground">Order Summary</h3>
                            <Separator className="my-4 bg-border/30" />
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.menu_item_id} className="flex justify-between text-sm">
                                        <span className="text-foreground/70">{item.name} x{item.quantity}</span>
                                        <span className="text-foreground/70">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4 bg-border/30" />
                            <div className="flex justify-between items-center">
                                <span className="font-accent uppercase tracking-wider text-white">Total</span>
                                <span className="font-heading text-2xl text-primary" data-testid="cart-total">
                                    ${total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={placing}
                            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm py-6 font-accent uppercase tracking-wider text-sm"
                            data-testid="place-order-btn"
                        >
                            {placing ? "Placing Order..." : "Place Order"}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
