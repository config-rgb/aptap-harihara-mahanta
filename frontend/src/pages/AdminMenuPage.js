import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_OPTIONS = [
    { value: "starters", label: "Starters" },
    { value: "main_course", label: "Main Course" },
    { value: "drinks", label: "Drinks" },
    { value: "desserts", label: "Desserts" },
];

const EMPTY_FORM = { name: "", description: "", price: "", category: "starters", image_url: "", available: true };

export default function AdminMenuPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");

    const token = localStorage.getItem("admin_token");
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    const fetchItems = useCallback(async () => {
        try {
            const params = categoryFilter !== "all" ? { category: categoryFilter } : {};
            const { data } = await axios.get(`${API}/menu`, { params });
            setItems(data);
        } catch (e) {
            toast.error("Failed to load menu items");
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description,
            price: String(item.price),
            category: item.category,
            image_url: item.image_url,
            available: item.available,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price || !form.category) {
            toast.error("Name, price, and category are required");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                category: form.category,
                image_url: form.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                available: form.available,
            };
            if (editingId) {
                await axios.put(`${API}/menu/${editingId}`, payload, authHeaders);
                toast.success("Item updated");
            } else {
                await axios.post(`${API}/menu`, payload, authHeaders);
                toast.success("Item created");
            }
            setDialogOpen(false);
            fetchItems();
        } catch (e) {
            toast.error("Failed to save item");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/menu/${id}`, authHeaders);
            toast.success("Item deleted");
            fetchItems();
        } catch (e) {
            toast.error("Failed to delete item");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Admin Nav */}
            <header className="border-b border-border/30 bg-card" data-testid="admin-menu-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/" className="font-heading text-xl text-primary">aptapcodes</Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link to="/admin/dashboard">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider">
                                <LayoutDashboard size={16} className="mr-1" /> <span className="hidden sm:inline">Orders</span>
                            </Button>
                        </Link>
                        <Link to="/admin/menu">
                            <Button variant="ghost" size="sm" className="text-primary font-accent text-xs uppercase tracking-wider">
                                <UtensilsCrossed size={16} className="mr-1" /> <span className="hidden sm:inline">Menu</span>
                            </Button>
                        </Link>
                        <Link to="/admin/qr-codes">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider">
                                <QrCode size={16} className="mr-1" /> <span className="hidden sm:inline">QR</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground/60 hover:text-destructive" data-testid="menu-logout-btn">
                            <LogOut size={16} />
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {["all", ...CATEGORY_OPTIONS.map(c => c.value)].map(f => (
                            <button
                                key={f}
                                onClick={() => setCategoryFilter(f)}
                                className={`font-accent text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm whitespace-nowrap ${
                                    categoryFilter === f
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                                }`}
                                style={{ transition: "background-color 0.2s, color 0.2s" }}
                                data-testid={`menu-filter-${f}`}
                            >
                                {f === "all" ? "All" : f === "main_course" ? "Main" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={openCreate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-accent text-xs uppercase tracking-wider"
                        data-testid="add-menu-item-btn"
                    >
                        <Plus size={16} className="mr-1" /> Add Item
                    </Button>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-card rounded-md animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground" data-testid="no-menu-items">
                        No menu items found
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {items.map(item => (
                            <motion.div
                                key={item.id}
                                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                                className="bg-card border border-border/40 rounded-md overflow-hidden"
                                data-testid={`admin-item-${item.id}`}
                            >
                                <div className="h-36 relative">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                                    />
                                    {!item.available && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Badge variant="destructive" className="font-accent uppercase tracking-wider text-xs">Unavailable</Badge>
                                        </div>
                                    )}
                                    <Badge className="absolute top-2 left-2 bg-black/60 text-foreground/80 border-none font-accent text-xs uppercase tracking-wider">
                                        {item.category === "main_course" ? "Main" : item.category}
                                    </Badge>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-heading text-base text-white">{item.name}</h3>
                                        <span className="font-accent text-primary font-bold text-base">${item.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.description}</p>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEdit(item)}
                                            className="flex-1 border-border/50 hover:border-primary hover:text-primary rounded-sm text-xs font-accent uppercase tracking-wider"
                                            data-testid={`edit-item-${item.id}`}
                                        >
                                            <Pencil size={12} className="mr-1" /> Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(item.id)}
                                            className="border-border/50 hover:border-destructive hover:text-destructive rounded-sm text-xs"
                                            data-testid={`delete-item-${item.id}`}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-card border-border/40 max-w-md" data-testid="menu-item-dialog">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl text-white">
                            {editingId ? "Edit Item" : "Add New Item"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1 bg-secondary/50 border-transparent focus:border-primary"
                                data-testid="item-name-input"
                            />
                        </div>
                        <div>
                            <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Description</label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="mt-1 bg-secondary/50 border-transparent focus:border-primary"
                                data-testid="item-description-input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Price ($)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="mt-1 bg-secondary/50 border-transparent focus:border-primary"
                                    data-testid="item-price-input"
                                />
                            </div>
                            <div>
                                <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Category</label>
                                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                    <SelectTrigger className="mt-1 bg-secondary/50 border-transparent" data-testid="item-category-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {CATEGORY_OPTIONS.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="font-accent text-xs uppercase tracking-wider text-muted-foreground">Image URL</label>
                            <Input
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                placeholder="https://..."
                                className="mt-1 bg-secondary/50 border-transparent focus:border-primary"
                                data-testid="item-image-input"
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-accent uppercase tracking-wider text-sm py-5"
                            data-testid="save-item-btn"
                        >
                            {saving ? "Saving..." : editingId ? "Update Item" : "Create Item"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
