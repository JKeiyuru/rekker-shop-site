import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "Saffron Milan", to: "/brands/saffron" },
      { label: "Cornells", to: "/brands/cornells" },
      { label: "Search", to: "/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Rekker", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Distributors", to: "/distributors" },
      { label: "Corporate site", to: "https://rekker.co.ke", external: true },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "My account", to: "/account" },
      { label: "Checkout", to: "/checkout" },
      { label: "Delivery info", to: "/contact" },
    ],
  },
];

function StoreFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold">R</span>
            <span className="font-display text-xl font-bold">REKKER<span className="text-primary">.</span></span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            One checkout for every Rekker brand — home care, beauty and fragrance,
            manufactured and distributed in Kenya.
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/60">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +254 700 000 000</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> shop@rekker.co.ke</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Nairobi, Kenya</p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white/40">{col.title}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.to} className="text-white/70 transition-colors hover:text-primary">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="text-white/70 transition-colors hover:text-primary">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rekker Limited. All rights reserved.</p>
          <p>Secure payments via M-Pesa, card &amp; PayPal.</p>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
