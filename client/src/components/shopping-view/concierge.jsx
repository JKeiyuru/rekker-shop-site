/* eslint-disable react/prop-types, react-hooks/exhaustive-deps */
// client/src/components/shopping-view/concierge.jsx
//
// The floating "Ask Rekker" concierge + WhatsApp button, shown on every shop page.
// Not a boring FAQ box — it works like a personal shopping assistant:
//   ✨ Find my match   – 3 taps (what → which type → budget) and it shows real,
//                        in-stock products you can add to the cart on the spot
//   🎁 Surprise me     – a little slot-machine reveal of a best seller
//   📦 Where's my order – live status of the shopper's latest orders
//   💬 Ask a question  – answers from the FAQ list the team edits in the admin
//   🙋 Talk to a person – opens WhatsApp with the conversation + page + cart pre-filled
// Anything it can't answer is handed to a human, and the team sees those
// questions in Admin → Chat & FAQs so they can teach it.
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowUp, Gift, MessageCircle, Package, Send, ShoppingBag, Sparkles, UserRound, X, HelpCircle, Loader2, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

const WHATSAPP = "254796183064";
const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const unit = (p) => (p?.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p?.price || 0);
const STATUS = { pending: ["Order received", 1], confirmed: ["Confirmed", 2], processing: ["Being prepared", 2], inProcess: ["Being prepared", 2], inShipping: ["On the way", 3], shipped: ["On the way", 3], delivered: ["Delivered", 4], rejected: ["Cancelled", 0], cancelled: ["Cancelled", 0] };
const pretty = (s) => String(s || "").replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

function Bubble({ from, children }) {
  return (
    <div className={`flex ${from === "me" ? "justify-end" : "justify-start"} animate-[fadeUp_.25s_ease-out]`}>
      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${from === "me" ? "rounded-br-md bg-gray-900 text-white" : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-black/5"}`}>{children}</div>
    </div>
  );
}
const Typing = () => (
  <div className="flex"><div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
    {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
  </div></div>
);
const Chip = ({ onClick, children, icon: Icon }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 active:scale-95">
    {Icon && <Icon className="h-3.5 w-3.5" />}{children}
  </button>
);

function MiniProduct({ p, onAdd, added }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5">
      <Link to={`/product/${p._id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100"><img src={p.image} alt="" className="h-full w-full object-cover" /></Link>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${p._id}`} className="block text-[13px] font-semibold leading-snug text-gray-900">{p.title}</Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gray-900">{kes(unit(p))}</span>
          <button onClick={() => onAdd(p)} disabled={added || p.totalStock < 1} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${added ? "bg-green-100 text-green-700" : "bg-red-600 text-white active:scale-95"} disabled:opacity-60`}>
            <ShoppingBag className="h-3.5 w-3.5" />{added ? "Added" : p.totalStock < 1 ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Slot-machine reveal for "Surprise me"
function Slot() {
  const [i, setI] = useState(0);
  const imgs = useRef([]);
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shop/products`, { params: { limit: 12, sortBy: "bestsellers" } })
      .then(({ data }) => { imgs.current = (data.data || []).map((p) => p.image).filter(Boolean); }).catch(() => {});
    const t = setInterval(() => setI((x) => x + 1), 110);
    return () => clearInterval(t);
  }, []);
  const src = imgs.current.length ? imgs.current[i % imgs.current.length] : null;
  return <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-2 ring-red-200">{src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <Gift className="h-8 w-8 animate-pulse text-red-400" />}</div>;
}

export default function Concierge() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);

  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [msgs, setMsgs] = useState([]);       // {from, node, key}
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [tree, setTree] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [added, setAdded] = useState({});
  const [mode, setMode] = useState("menu");   // menu | ask
  const lastQuestion = useRef("");
  const endRef = useRef(null);
  const started = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, typing, open]);

  // gentle one-time nudge so people discover it
  useEffect(() => {
    if (sessionStorage.getItem("concierge_nudged")) return;
    const t = setTimeout(() => { if (!open) { setNudge(true); sessionStorage.setItem("concierge_nudged", "1"); setTimeout(() => setNudge(false), 9000); } }, 18000);
    return () => clearTimeout(t);
  }, []);

  const say = useCallback((from, node, delay = 0) => new Promise((res) => {
    const push = () => { setTyping(false); setMsgs((m) => [...m, { from, node, key: Math.random() }]); res(); };
    if (from === "bot" && delay) { setTyping(true); setTimeout(push, delay); } else push();
  }), []);

  // ── open + greeting ──
  async function openChat() {
    setOpen(true); setNudge(false);
    if (started.current) return;
    started.current = true;
    axios.get(`${API_BASE_URL}/api/shop/categories`).then(({ data }) => setTree(data.data || [])).catch(() => {});
    axios.get(`${API_BASE_URL}/api/shop/assistant/faqs`).then(({ data }) => setFaqs(data.data || [])).catch(() => {});
    const first = user?.userName ? user.userName.split(" ")[0] : "";
    await say("bot", <>Hi{first ? ` ${first}` : ""}! 👋 I'm your Rekker shopping assistant.</>, 500);
    await say("bot", "What can I help you with?", 700);
    setMsgs((m) => [...m, { from: "bot", key: "menu" + Math.random(), node: "__MENU__" }]);
  }

  // ── actions ──
  const handoff = (extra) => {
    const cart = (cartItems?.items || []).map((i) => `${i.quantity}× ${i.title}`).join(", ");
    const text = [`Hi Rekker! I need help from a person.`, extra || (lastQuestion.current ? `My question: ${lastQuestion.current}` : ""), cart ? `My cart: ${cart}` : "", `I'm on: ${window.location.href}`].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  async function talkToPerson() {
    await say("me", "I'd like to talk to a person");
    await say("bot", "Of course! I'll open WhatsApp with your details already filled in, so you won't have to repeat yourself. 💬", 600);
    handoff();
  }

  async function addProduct(p) {
    if (!isAuthenticated) { await say("bot", <>Please <Link to="/auth/login" className="font-semibold text-red-700 underline">log in</Link> so I can add this to your cart.</>, 300); return; }
    const res = await dispatch(addToCart({ userId: user.id, productId: p._id, quantity: 1 }));
    if (res?.payload?.success) { dispatch(fetchCartItems(user.id)); setAdded((a) => ({ ...a, [p._id]: true })); }
    else await say("bot", res?.payload?.message || "Sorry, I couldn't add that one.", 300);
  }

  const showProducts = async (list, intro) => {
    if (!list.length) { await say("bot", "Hmm, nothing matches that right now. Want to try a different pick, or chat with a person?", 600); setMsgs((m) => [...m, { from: "bot", key: "menu" + Math.random(), node: "__MENU__" }]); return; }
    await say("bot", intro, 700);
    await say("bot", { products: list }, 400);
    await say("bot", <>Want to keep going? <Link to="/products" className="font-semibold text-red-700 underline">Browse everything</Link></>, 500);
    setMsgs((m) => [...m, { from: "bot", key: "menu" + Math.random(), node: "__MENU__" }]);
  };

  async function startQuiz() {
    await say("me", "✨ Find my perfect match");
    await say("bot", "Love it. What are we taking care of?", 600);
    setMsgs((m) => [...m, { from: "bot", key: "q1" + Math.random(), node: "__Q1__" }]);
  }
  async function pickMain(c) {
    await say("me", c.name);
    const subs = c.children || [];
    if (!subs.length) return pickBudget(c, null);
    await say("bot", `Great — which kind of ${c.name.toLowerCase()}?`, 500);
    setMsgs((m) => [...m, { from: "bot", key: "q2" + Math.random(), node: { main: c } }]);
  }
  async function pickSub(main, sub) {
    await say("me", sub ? sub.name : `Anything in ${main.name}`);
    await pickBudget(main, sub);
  }
  async function pickBudget(main, sub) {
    await say("bot", "And what feels right for your budget?", 500);
    setMsgs((m) => [...m, { from: "bot", key: "q3" + Math.random(), node: { main, sub, budget: true } }]);
  }
  async function finishQuiz(main, sub, max, label) {
    await say("me", label);
    setTyping(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/shop/products`, { params: { category: (sub || main).slug, sortBy: "bestsellers", limit: 24 } });
      const inStock = (data.data || []).filter((p) => p.totalStock > 0 && unit(p) <= max);
      setTyping(false);
      await showProducts(inStock.slice(0, 3), `Here are our top picks for you ✨`);
    } catch { setTyping(false); await say("bot", "Sorry, I couldn't load products just now. Please try again.", 300); }
  }

  async function surprise() {
    await say("me", "🎁 Surprise me!");
    await say("bot", <Slot />, 300);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/shop/products`, { params: { sortBy: "bestsellers", limit: 20 } });
      const pool = (data.data || []).filter((p) => p.totalStock > 0);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      await new Promise((r) => setTimeout(r, 1700));
      await showProducts(pick ? [pick] : [], "Tada! 🎉 One of our customer favourites:");
    } catch { await say("bot", "The surprise machine jammed — try again in a moment!", 300); }
  }

  async function trackOrder() {
    await say("me", "📦 Where's my order?");
    if (!isAuthenticated || !user) { await say("bot", <>Log in and I'll show your latest orders. <Link to="/auth/login" className="font-semibold text-red-700 underline">Log in</Link></>, 600); return; }
    setTyping(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/shop/order/list/${user.id}`, { withCredentials: true });
      const orders = (data.data || []).slice(0, 3);
      setTyping(false);
      if (!orders.length) { await say("bot", "You haven't placed an order yet — want me to help you find something?", 400); return; }
      await say("bot", <div className="w-[250px] space-y-2">{orders.map((o) => {
        const [label, step] = STATUS[o.orderStatus] || [pretty(o.orderStatus), 1];
        return (
          <div key={o._id} className="rounded-xl bg-gray-50 p-3 ring-1 ring-black/5">
            <div className="flex justify-between text-xs text-gray-500"><span>#{String(o._id).slice(-8).toUpperCase()}</span><span>{new Date(o.orderDate || o.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</span></div>
            <p className="mt-0.5 font-semibold text-gray-900">{label} · {kes(o.totalAmount)}</p>
            {step > 0 && <div className="mt-2 flex gap-1">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-green-500" : "bg-gray-200"}`} />)}</div>}
            {step > 0 && <div className="mt-1 flex justify-between text-[10px] text-gray-400"><span>Received</span><span>Preparing</span><span>On the way</span><span>Delivered</span></div>}
          </div>
        );
      })}</div>, 300);
      await say("bot", <>Need more detail? <button onClick={() => handoff("I'd like an update on my order.")} className="font-semibold text-red-700 underline">Ask our team</button></>, 500);
    } catch { setTyping(false); await say("bot", "I couldn't load your orders just now. You can also find them in My Account.", 300); }
  }

  async function askQuestion(text, faqId) {
    const q = (text || "").trim();
    if (!q && !faqId) return;
    lastQuestion.current = q || lastQuestion.current;
    await say("me", q);
    setTyping(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/shop/assistant/ask`, faqId ? { faqId } : { text: q });
      if (data.matched) {
        setTyping(false);
        await say("bot", <><p>{data.answer}</p>{data.link && <Link to={data.link} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 font-semibold text-red-700 underline">{data.linkLabel || "Open"} <ChevronRight className="h-3.5 w-3.5" /></Link>}</>, 400);
        await say("bot", <div className="flex flex-wrap gap-2"><Chip onClick={() => say("me", "That helped, thanks!").then(() => say("bot", "Happy to help! 😊", 400))}>👍 Thanks!</Chip><Chip onClick={() => handoff()}>Still need a person</Chip></div>, 500);
      } else {
        setTyping(false);
        await say("bot", "I'm not sure about that one — and I'd rather not guess! A real person can answer it properly. 💬", 500);
        await say("bot", <div className="flex flex-wrap gap-2"><Chip icon={MessageCircle} onClick={() => handoff()}>Ask on WhatsApp</Chip></div>, 300);
      }
    } catch { setTyping(false); await say("bot", "Sorry, I had a hiccup. You can reach our team on WhatsApp.", 300); }
  }
  async function openAsk() {
    await say("me", "💬 I have a question");
    setMode("ask");
    await say("bot", "Sure! Type your question below, or tap a common one:", 500);
    setMsgs((m) => [...m, { from: "bot", key: "faq" + Math.random(), node: "__FAQ__" }]);
  }

  // render special placeholder nodes
  const renderNode = (n) => {
    if (n === "__MENU__") return (
      <div className="grid w-[250px] grid-cols-2 gap-2">
        {[[Sparkles, "Find my match", "Pick products in 3 taps", startQuiz], [Gift, "Surprise me", "A random favourite", surprise], [Package, "My order", "Check its status", trackOrder], [HelpCircle, "Ask a question", "Delivery, payment…", openAsk]].map(([Icon, t, s, fn]) => (
          <button key={t} onClick={fn} className="rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-black/5 transition hover:ring-red-300 active:scale-95">
            <Icon className="h-5 w-5 text-red-600" /><p className="mt-1.5 text-sm font-bold text-gray-900">{t}</p><p className="text-[11px] text-gray-500">{s}</p>
          </button>
        ))}
        <button onClick={talkToPerson} className="col-span-2 flex items-center gap-3 rounded-xl bg-green-600 p-3 text-left text-white shadow-sm transition active:scale-95">
          <UserRound className="h-5 w-5" /><div><p className="text-sm font-bold">Talk to a person</p><p className="text-[11px] text-white/80">Opens WhatsApp with your details</p></div>
        </button>
      </div>
    );
    if (n && n.products) return <div className="w-[250px] space-y-2">{n.products.map((p) => <MiniProduct key={p._id} p={p} onAdd={addProduct} added={!!added[p._id]} />)}</div>;
    if (n === "__Q1__") return <div className="flex max-w-[270px] flex-wrap gap-2">{tree.slice(0, 8).map((c) => <Chip key={c._id} onClick={() => pickMain(c)}>{c.name}</Chip>)}</div>;
    if (n === "__FAQ__") return <div className="flex max-w-[270px] flex-wrap gap-2">{faqs.slice(0, 6).map((f) => <Chip key={f._id} onClick={() => askQuestion(f.question, f._id)}>{f.question}</Chip>)}</div>;
    if (n && n.main && !n.budget) return <div className="flex max-w-[270px] flex-wrap gap-2">{n.main.children.map((s) => <Chip key={s._id} onClick={() => pickSub(n.main, s)}>{s.name}</Chip>)}<Chip onClick={() => pickSub(n.main, null)}>Show me all</Chip></div>;
    if (n && n.budget) return <div className="flex flex-wrap gap-2">{[["Under KES 700", 700], ["Up to KES 1,000", 1000], ["Treat myself", 1e9]].map(([l, max]) => <Chip key={l} onClick={() => finishQuiz(n.main, n.sub, max, l)}>{l}</Chip>)}</div>;
    return n;
  };

  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.includes("checkout") || pathname === "/cart";
  if (hidden) return null;

  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes ringPulse{0%{box-shadow:0 0 0 0 rgba(220,38,38,.45)}100%{box-shadow:0 0 0 16px rgba(220,38,38,0)}}`}</style>

      {/* Floating buttons */}
      {!open && (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
          {nudge && (
            <button onClick={openChat} className="max-w-[220px] animate-[fadeUp_.3s_ease-out] rounded-2xl rounded-br-sm bg-white px-4 py-3 text-left text-sm shadow-xl ring-1 ring-black/5">
              <span className="font-semibold text-gray-900">Not sure what to pick?</span><br /><span className="text-gray-600">I'll find your perfect match in 3 taps ✨</span>
            </button>
          )}
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Rekker! I have a question.")}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
            className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 active:scale-95">
            <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current"><path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.13.56 4.2 1.62 6.03L4 28l7.1-1.86a12 12 0 0 0 4.93 1.05h.01C22.67 27.2 28 21.8 28 15.17 28 8.4 22.68 3 16.04 3Zm0 21.9h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-4.21 1.1 1.12-4.1-.24-.38a9.97 9.97 0 0 1-1.53-5.3c0-5.5 4.5-9.97 10.05-9.97 5.54 0 10.04 4.47 10.04 9.97 0 5.5-4.5 10.3-10.04 10.3Zm5.5-7.46c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.1 3.2 5.1 4.48.7.3 1.27.5 1.7.62.72.23 1.37.2 1.88.12.57-.08 1.78-.72 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" /></svg>
          </a>
          <button onClick={openChat} aria-label="Open shopping assistant" className="relative flex h-14 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95" style={{ animation: "ringPulse 2.4s ease-out infinite" }}>
            <Sparkles className="h-5 w-5 text-red-400" /> Ask Rekker
          </button>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex h-[78vh] flex-col overflow-hidden rounded-t-3xl bg-gray-50 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[380px] sm:rounded-3xl">
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-700 to-rose-600 px-4 py-3.5 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20"><Sparkles className="h-5 w-5" /></div>
            <div className="flex-1"><p className="font-bold leading-tight">Rekker Assistant</p><p className="text-xs text-white/80">Instant answers · real people on WhatsApp</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 hover:bg-white/15"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => <Bubble key={m.key} from={m.from}>{renderNode(m.node)}</Bubble>)}
            {typing && <Typing />}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); const t = input; setInput(""); askQuestion(t); }} className="flex items-center gap-2 border-t bg-white p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question…" maxLength={200}
              className="h-11 min-w-0 flex-1 rounded-full bg-gray-100 px-4 text-sm outline-none focus:ring-2 focus:ring-red-200" />
            <button type="submit" disabled={!input.trim()} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-red-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
            <button type="button" onClick={() => setMsgs((m) => [...m, { from: "bot", key: "menu" + Math.random(), node: "__MENU__" }])} aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-full bg-gray-900 text-white"><ArrowUp className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
