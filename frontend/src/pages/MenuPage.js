import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
    { value: "all", label: "All" },
    { value: "starters", label: "Starters" },
    { value: "main_course", label: "Main Course" },
    { value: "drinks", label: "Drinks" },
    { value: "desserts", label: "Desserts" },
];

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const { addItem, updateQuantity, itemCount, setTable, items: cartItems } = useCart();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const tableNumber = searchParams.get("table");

    useEffect(() => {
        if (tableNumber) setTable(parseInt(tableNumber));
    }, [tableNumber, setTable]);

    const fetchMenu = useCallback(async () => {
        try {
            const params = {};
            if (category !== "all") params.category = category;
            if (search) params.search = search;
            const { data } = await axios.get(`${API}/menu`, { params });
            setMenuItems(data);
        } catch (e) {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const handleAdd = (item) => {
        addItem({
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
        });
        toast.success(`${item.name} added to cart`);
    };

    const getQty = (itemId) => {
        const c = cartItems.find(i => i.menu_item_id === itemId);
        return c ? c.quantity : 0;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 glass" data-testid="menu-header">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" data-testid="back-home-link">
                            <ArrowLeft className="text-foreground/70 hover:text-primary" size={20} style={{ transition: "color 0.2s" }} />
                        </Link>
                        <h1 className="font-heading text-xl text-white">Menu</h1>
                        {tableNumber && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-accent text-xs tracking-wider" data-testid="table-badge">
                                Table {tableNumber}
                            </Badge>
                        )}
                    </div>
                    <Link to="/cart" data-testid="cart-link">
                        <Button variant="ghost" className="relative p-2">
                            <ShoppingCart className="text-foreground/70" size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Search */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        data-testid="menu-search-input"
                        placeholder="Search dishes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 bg-secondary/50 border-transparent focus:border-primary rounded-full h-11"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="sticky top-[56px] z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-border/20">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            data-testid={`category-${cat.value}`}
                            className={`font-accent text-xs uppercase tracking-wider px-4 py-2 rounded-sm whitespace-nowrap ${
                                category === cat.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                            }`}
                            style={{ transition: "background-color 0.2s, color 0.2s" }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-card rounded-md animate-pulse" />
                        ))}
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground" data-testid="no-items-msg">
                        No items found
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {menuItems.filter(i => i.available !== false).map(item => {
                            const qty = getQty(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                    className="bg-card border border-border/40 hover:border-primary/30 rounded-md overflow-hidden flex"
                                    style={{ transition: "border-color 0.3s" }}
                                    data-testid={`menu-item-${item.id}`}
                                >
                                    <div className="w-28 sm:w-32 flex-shrink-0">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                                        />
                                    </div>
                                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-h-[120px]">
                                        <div>
                                            <h3 className="font-heading text-sm sm:text-base text-white leading-tight">{item.name}</h3>
                                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="font-accent text-base sm:text-lg text-primary tracking-wide font-bold">
                                                ${item.price.toFixed(2)}
                                            </span>
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, qty - 1)}
                                                        className="w-7 h-7 rounded-sm bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
                                                        style={{ transition: "background-color 0.2s, color 0.2s" }}
                                                        data-testid={`decrease-${item.id}`}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-7 text-center text-sm font-bold text-white" data-testid={`qty-${item.id}`}>{qty}</span>
                                                    <button
                                                        onClick={() => handleAdd(item)}
                                                        className="w-7 h-7 rounded-sm bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80"
                                                        style={{ transition: "background-color 0.2s" }}
                                                        data-testid={`increase-${item.id}`}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAdd(item)}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-8 text-xs font-accent uppercase tracking-wider"
                                                    data-testid={`add-to-cart-${item.id}`}
                                                >
                                                    <Plus size={14} className="mr-1" /> Add
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Floating Cart */}
            {itemCount > 0 && (
                <Link to="/cart" data-testid="floating-cart-btn">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto glass rounded-full px-6 py-4 flex items-center justify-between md:justify-center gap-4 z-50 animate-pulse-gold cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="text-primary" size={20} />
                            <span className="text-white text-sm">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                        </div>
                        <span className="font-accent text-primary text-base uppercase tracking-wider">View Cart</span>
                    </motion.div>
                </Link>
            )}

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
