import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Download } from "lucide-react";

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function AdminQRCodesPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("admin_token");

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    const getMenuUrl = (tableNum) => `${window.location.origin}/menu?table=${tableNum}`;

    const downloadQR = (tableNum) => {
        const svg = document.getElementById(`qr-${tableNum}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = 400;
            canvas.height = 480;
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, 400, 480);
            ctx.drawImage(img, 50, 30, 300, 300);
            ctx.fillStyle = "#D4AF37";
            ctx.font = "bold 28px 'Barlow Condensed', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`TABLE ${tableNum}`, 200, 380);
            ctx.fillStyle = "#a3a3a3";
            ctx.font = "14px 'DM Sans', sans-serif";
            ctx.fillText("Scan to Order", 200, 420);
            ctx.fillText("aptapcodes", 200, 460);
            const a = document.createElement("a");
            a.download = `table-${tableNum}-qr.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Admin Nav */}
            <header className="border-b border-border/30 bg-card" data-testid="admin-qr-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/" className="font-heading text-xl text-primary">aptapcodes</Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link to="/admin/dashboard">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider">
                                <LayoutDashboard size={16} className="mr-1" /> <span className="hidden sm:inline">Orders</span>
                            </Button>
                        </Link>
                        <Link to="/admin/menu">
                            <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-primary font-accent text-xs uppercase tracking-wider">
                                <UtensilsCrossed size={16} className="mr-1" /> <span className="hidden sm:inline">Menu</span>
                            </Button>
                        </Link>
                        <Link to="/admin/qr-codes">
                            <Button variant="ghost" size="sm" className="text-primary font-accent text-xs uppercase tracking-wider">
                                <QrCode size={16} className="mr-1" /> <span className="hidden sm:inline">QR</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground/60 hover:text-destructive" data-testid="qr-logout-btn">
                            <LogOut size={16} />
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="font-heading text-3xl text-white">QR Codes</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Print and place these QR codes on each table. Customers scan to order directly from their phones.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                    {TABLES.map(num => (
                        <motion.div
                            key={num}
                            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
                            className="glass-card rounded-md p-4 flex flex-col items-center group hover:border-primary/30"
                            style={{ transition: "border-color 0.3s" }}
                            data-testid={`qr-table-${num}`}
                        >
                            <div className="font-accent text-xs uppercase tracking-widest text-muted-foreground mb-3">
                                Table {num}
                            </div>
                            <div className="bg-white p-3 rounded-md">
                                <QRCodeSVG
                                    id={`qr-${num}`}
                                    value={getMenuUrl(num)}
                                    size={140}
                                    level="H"
                                    fgColor="#0a0a0a"
                                    bgColor="#ffffff"
                                />
                            </div>
                            <div className="text-muted-foreground text-[10px] mt-3 text-center break-all px-1">
                                {getMenuUrl(num)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadQR(num)}
                                className="mt-3 w-full border-border/50 hover:border-primary hover:text-primary rounded-sm text-xs font-accent uppercase tracking-wider opacity-0 group-hover:opacity-100"
                                style={{ transition: "opacity 0.3s, border-color 0.2s, color 0.2s" }}
                                data-testid={`download-qr-${num}`}
                            >
                                <Download size={12} className="mr-1" /> Download
                            </Button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
