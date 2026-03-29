import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DollarSign,
  Leaf,
  Search,
  ShoppingCart,
  Snowflake,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import { Category, useProductsByCategory } from "./hooks/useQueries";

const queryClient = new QueryClient();

function formatPrice(cents: bigint): string {
  const n = Number(cents);
  return `$${(n / 100).toFixed(2)}`;
}

type CartItem = { product: Product; qty: number };

const CATEGORY_TABS = [
  { label: "All", value: null },
  { label: "🍟 Chips", value: Category.chips },
  { label: "🥤 Drinks", value: Category.drink },
  { label: "⚡ Energy", value: Category.energy },
] as const;

const FEATURES = [
  {
    icon: Zap,
    emoji: "⚡",
    title: "Lightning Fast Delivery",
    desc: "30 minutes or less, guaranteed!",
  },
  {
    icon: Snowflake,
    emoji: "❄️",
    title: "Ice Cold Drinks",
    desc: "Always chilled to perfection",
  },
  {
    icon: Leaf,
    emoji: "🥗",
    title: "Fresh & Crispy Chips",
    desc: "Never stale, always crunch",
  },
  {
    icon: DollarSign,
    emoji: "💰",
    title: "Best Prices",
    desc: "Affordable snacks for everyone",
  },
];

function ProductCard({
  product,
  onAdd,
  index,
}: { product: Product; onAdd: (p: Product) => void; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-ocid={`product.item.${index + 1}`}
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.88 0.06 10), oklch(0.92 0.04 355))",
          }}
        >
          {product.emoji}
        </div>
        <h3 className="font-bold text-base text-foreground mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 capitalize">
          {product.category}
        </p>
        <p className="text-2xl font-extrabold text-accent mb-4">
          {formatPrice(product.price)}
        </p>
        <Button
          data-ocid={`product.button.${index + 1}`}
          onClick={() => onAdd(product)}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

function ProductSection({ onAdd }: { onAdd: (p: Product) => void }) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const { data: products = [], isLoading } =
    useProductsByCategory(activeCategory);

  return (
    <section id="products" className="py-16">
      <h2 className="text-4xl font-extrabold text-center text-primary mb-4">
        🍟 Featured Products
      </h2>
      <p className="text-center text-muted-foreground mb-8">
        Choose from our crunchy chips, refreshing drinks & energy boosters
      </p>

      <div
        className="flex justify-center gap-2 mb-10 flex-wrap"
        data-ocid="products.tab"
      >
        {CATEGORY_TABS.map((tab) => (
          <button
            type="button"
            key={String(tab.value)}
            onClick={() => setActiveCategory(tab.value)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
              activeCategory === tab.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-foreground hover:bg-muted shadow-xs"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div
          data-ocid="products.loading_state"
          className="flex justify-center items-center py-20"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.emoji} ${product.name} added to cart!`, {
      description: formatPrice(product.price),
      position: "top-right",
    });
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="text-xl font-extrabold tracking-tight whitespace-nowrap">
            🍟🥤 Chips &amp; Drinks
          </div>

          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {["home", "products", "features", "about"].map((id) => (
              <button
                type="button"
                key={id}
                data-ocid={`nav.${id}.link`}
                onClick={() => scrollTo(id)}
                className="capitalize font-medium hover:text-yellow-300 transition-colors text-sm"
              >
                {id === "products"
                  ? "Shop"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 flex-1 justify-end max-w-xs">
            <div className="hidden sm:flex items-center bg-primary-foreground/15 rounded-full px-3 py-1.5 gap-2 flex-1">
              <Search className="h-4 w-4 opacity-70" />
              <input
                data-ocid="header.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snacks..."
                className="bg-transparent text-sm outline-none placeholder:text-primary-foreground/60 text-primary-foreground w-full"
              />
            </div>

            <button
              type="button"
              data-ocid="cart.button"
              onClick={() => scrollTo("products")}
              className="relative flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full px-4 py-2 font-semibold text-sm transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section
          id="home"
          className="min-h-[90vh] flex items-center justify-center text-center px-6 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-block bg-accent/10 text-accent font-semibold text-sm px-4 py-1.5 rounded-full mb-6 border border-accent/20">
              ⚡ Fast delivery · Always fresh · Best prices
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-primary tracking-tight uppercase leading-none mb-6">
              🍟🥤
              <br />
              CRUNCH &amp;
              <br />
              REFRESH
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-md mx-auto">
              Your favorite chips, cold drinks &amp; energy boosts delivered
              fast!
            </p>
            <Button
              data-ocid="hero.primary_button"
              onClick={() => scrollTo("products")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Shop Now →
            </Button>
          </motion.div>
        </section>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductSection onAdd={addToCart} />
        </div>

        {/* Why Choose Us */}
        <section id="features" className="py-20 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-card rounded-3xl p-10 shadow-card">
              <h2 className="text-4xl font-extrabold text-center text-primary mb-2">
                🚀 Why Choose Us?
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                We make snack time better, every time
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="text-center p-4"
                  >
                    <div className="text-5xl mb-4">{f.emoji}</div>
                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Collections */}
        <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-extrabold text-center text-primary mb-4">
            🍿 Top Collections
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Our most-loved snack families
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "🍟",
                label: "Chips",
                desc: "Crunchy. Salty. Irresistible.",
                color: "oklch(0.95 0.04 55)",
              },
              {
                emoji: "🥤",
                label: "Drinks",
                desc: "Ice-cold. Always refreshing.",
                color: "oklch(0.92 0.06 200)",
              },
              {
                emoji: "⚡",
                label: "Energy",
                desc: "Power through your day.",
                color: "oklch(0.95 0.05 85)",
              },
            ].map((col, i) => (
              <motion.div
                key={col.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="rounded-2xl p-8 text-center shadow-card cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                style={{ background: col.color }}
              >
                <div className="text-6xl mb-4">{col.emoji}</div>
                <h3 className="font-extrabold text-xl mb-2">{col.label}</h3>
                <p className="text-sm text-muted-foreground">{col.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-footer text-footer-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-extrabold text-lg mb-4">
                🍟🥤 Chips &amp; Drinks
              </h4>
              <p className="text-sm opacity-75">
                Your ultimate snack stop. Chips, drinks & energy, delivered
                fast.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li>Chips</li>
                <li>Drinks</li>
                <li>Energy Drinks</li>
                <li>Bundles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-sm opacity-60">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:opacity-100 transition-opacity"
              target="_blank"
              rel="noreferrer"
            >
              Built with love using caffeine.ai
            </a>{" "}
            🍟🥤⚡
          </div>
        </div>
      </footer>

      <Toaster richColors />
    </>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
