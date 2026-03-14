import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QrCode, Utensils, ChefHat, Clock, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 glass" data-testid="home-header">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="font-heading text-2xl text-primary tracking-tight">
                        aptapcodes
                    </Link>
                    <div className="flex gap-2 items-center">
                        <Link to="/menu">
                            <Button variant="ghost" className="text-foreground/80 hover:text-primary text-sm" data-testid="nav-menu-btn">
                                Menu
                            </Button>
                        </Link>
                        <Link to="/admin/login">
                            <Button variant="ghost" className="text-foreground/80 hover:text-primary text-sm" data-testid="nav-admin-btn">
                                Admin
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative h-screen flex items-center" data-testid="hero-section">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop"
                        alt="Restaurant ambience"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl"
                    >
                        <span className="font-accent text-sm tracking-[0.3em] text-primary uppercase">
                            Fine Dining Experience
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mt-4 leading-tight">
                            Savor Every{" "}
                            <span className="animate-shimmer">Moment</span>
                        </h1>
                        <p className="text-foreground/60 mt-6 text-base sm:text-lg max-w-md leading-relaxed">
                            Scan, order, and indulge. A seamless dining experience crafted for the modern palate.
                        </p>
                        <div className="flex gap-4 mt-10">
                            <Link to="/menu">
                                <Button
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 py-6 font-accent uppercase tracking-wider text-sm"
                                    data-testid="hero-view-menu-btn"
                                >
                                    View Menu <ArrowRight className="ml-2" size={18} />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6" data-testid="how-it-works-section">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <span className="font-accent text-sm tracking-[0.3em] text-primary uppercase">
                            Simple Process
                        </span>
                        <h2 className="font-heading text-3xl sm:text-4xl text-white mt-3">
                            How It Works
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        {[
                            { icon: QrCode, title: "Scan QR Code", desc: "Find the QR code on your table and scan it with your phone camera" },
                            { icon: Utensils, title: "Browse & Order", desc: "Explore our curated menu and add your favorites to cart" },
                            { icon: ChefHat, title: "Enjoy Your Meal", desc: "Sit back while our chefs prepare your order fresh to perfection" },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="glass-card p-8 rounded-md text-center group hover:border-primary/30"
                                style={{ transition: "border-color 0.3s" }}
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20" style={{ transition: "background-color 0.3s" }}>
                                    <step.icon className="text-primary" size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-heading text-xl text-white mt-6">{step.title}</h3>
                                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="py-24 px-6 bg-card/50" data-testid="about-section">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="font-accent text-sm tracking-[0.3em] text-primary uppercase">
                            Our Story
                        </span>
                        <h2 className="font-heading text-3xl sm:text-4xl text-white mt-4">
                            Where Tradition Meets Innovation
                        </h2>
                        <p className="text-muted-foreground mt-6 leading-relaxed text-sm sm:text-base">
                            At aptapcodes, we believe dining should be effortless and extraordinary. Our QR-powered ordering system lets you focus on what matters most - the flavors, the company, and the ambience. Every dish is crafted with passion, using the finest ingredients sourced from local artisans.
                        </p>
                        <div className="flex gap-10 mt-10">
                            {[
                                { num: "16+", label: "Dishes" },
                                { num: "10", label: "Tables" },
                                { num: "4.9", label: "Rating" },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="font-heading text-3xl text-primary">{stat.num}</div>
                                    <div className="font-accent text-xs tracking-widest uppercase text-muted-foreground mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop"
                            alt="Restaurant dishes"
                            className="rounded-md w-full h-[400px] object-cover"
                        />
                        <div className="absolute inset-0 rounded-md" style={{ border: "1px solid rgba(212,175,55,0.2)" }} />
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border/30" data-testid="footer">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-heading text-xl text-primary">aptapcodes</div>
                    <div className="flex gap-6 text-muted-foreground text-sm">
                        <Link to="/menu" className="hover:text-primary" style={{ transition: "color 0.2s" }}>Menu</Link>
                        <Link to="/admin/login" className="hover:text-primary" style={{ transition: "color 0.2s" }}>Admin</Link>
                    </div>
                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                        <Clock size={14} /> Open Daily 11AM - 11PM
                    </div>
                </div>
            </footer>
        </div>
    );
}
