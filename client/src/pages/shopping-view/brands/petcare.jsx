/* eslint-disable react/no-unescaped-entities */
// client/src/pages/shopping-view/brands/petcare.jsx
// PetCare brand page. Story and values are written here (from the PetCare brand
// profile); name/slug/images/theme come from the PetCare record in Admin → Brands
// so the "Shop" buttons always point at the right product filter.
import { Link } from "react-router-dom";
import { ArrowRight, Award, FlaskConical, HeartHandshake, Lightbulb, PawPrint, ShieldCheck, Sparkles } from "lucide-react";
import useSeo from "@/hooks/use-seo";
import useBrands from "@/hooks/use-brands";
import BrandProductRail from "@/components/shopping-view/brand-product-rail";
import { findBrand, productsPath } from "@/lib/brand-utils";

const GREEN = "#14532d";
const GOLD = "#c9a227";

const values = [
  { icon: ShieldCheck, title: "Safety First", copy: "The well-being of pets guides our product decisions. We prioritise appropriate ingredients, careful formulation and responsible product development." },
  { icon: Award, title: "Premium Quality", copy: "Good pet care begins with products developed to meet high standards of quality, consistency and performance." },
  { icon: HeartHandshake, title: "Care and Compassion", copy: "We recognise the special bond between pets and their owners and approach our work with empathy, responsibility and love for animals." },
  { icon: Lightbulb, title: "Thoughtful Innovation", copy: "We invest in research, product development and continuous improvement to create products that respond to real pet-care needs." },
  { icon: FlaskConical, title: "Trust and Responsibility", copy: "We aim to earn the trust of pet owners through honest communication, responsible practices and a consistent commitment to pet well-being." },
];

const journey = [
  { when: "January", title: "The beginning", copy: "PetCare is introduced with a commitment to developing premium products for pets, with safety and quality at the heart of the brand." },
  { when: "First three months", title: "Research & development", copy: "Three months spent researching pet-care needs and how to develop products that match our standards and ambitions." },
  { when: "Following two months", title: "Product development", copy: "We bring our first product to life, refining our premium pet shampoo before its introduction to the market." },
  { when: "May", title: "First product launch", copy: "PetCare's premium pet shampoo enters the market — the first step in bringing thoughtful, quality-led products to pets and their owners." },
];

export default function PetCareBrandPage() {
  const { brands } = useBrands();
  // match however the brand was typed in the admin: PetCare / pet-care / Pet Care
  const brand = findBrand(brands, "petcare") || { name: "PetCare", slug: "petcare" };
  const shop = productsPath(brand);

  useSeo({
    title: "PetCare — Premium Pet Shampoo for Dogs, Cats & Horses",
    description: "PetCare is a premium pet-care brand by Rekker. Little Paws, Lots of Love. Shop PetCare pet shampoo, delivered across Kenya with M-Pesa and card checkout.",
    path: "/brands/petcare",
    image: "https://shop.rekker.co.ke/images/petcare-banner.jpg",
    jsonLd: { "@context": "https://schema.org", "@type": "Brand", name: "PetCare", slogan: "Little Paws, Lots of Love.", url: "https://shop.rekker.co.ke/brands/petcare", logo: "https://shop.rekker.co.ke/images/petcare-logo.jpg" },
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #0b2e19 100%)` }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full blur-3xl" style={{ background: `${GOLD}33` }} />
        <div className="container relative mx-auto grid gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/75">
              <PawPrint className="h-3.5 w-3.5" style={{ color: GOLD }} /> Premium pet care · A Rekker brand
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">PetCare</h1>
            <p className="mt-3 font-display text-2xl sm:text-3xl" style={{ color: GOLD }}>Little Paws, Lots of Love.</p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75">
              Premium care for the pets who make life better. Guided by our commitment to safety, quality and animal well-being, we're building a brand dedicated to making everyday pet care better.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={shop} className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink shadow-lg transition hover:scale-[1.03]">
                Shop Pet Shampoo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a href="#story" className="inline-flex items-center rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Discover our story</a>
            </div>
          </div>
          <Link to={shop} className="block overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl" aria-label="Shop PetCare">
            <img src={brand.bannerUrl || "/images/petcare-banner.jpg"} alt="PetCare — Premium Care. Happier Pets." className="h-full w-full object-cover" />
          </Link>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="scroll-mt-20 container mx-auto grid gap-12 px-4 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>About PetCare</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">A little more love in every wash</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>PetCare is a premium pet-care brand dedicated to making everyday pet care safer, gentler and more enjoyable. Built on a passion for animal well-being and a commitment to quality, we create products that help pet owners care for their beloved companions with confidence.</p>
            <p>We introduced PetCare in January, beginning with extensive research and development to understand the needs of pets and their owners. After three months of research and a further two months developing our first product, our premium pet shampoo reached the market in May.</p>
            <p>Our journey began with one essential product, but our ambition extends much further. We're building a brand for all things pets — because every wagging tail, playful pounce and loving nuzzle deserves the very best.</p>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl p-8 text-white" style={{ background: GREEN }}>
          <h3 className="font-display text-xl font-bold">Our mission</h3>
          <p className="text-white/80">To provide premium, thoughtfully developed pet-care products that prioritise animal safety, support everyday pet well-being and give pet owners greater confidence in how they care for their companions.</p>
          <h3 className="pt-2 font-display text-xl font-bold">Our vision</h3>
          <p className="text-white/80">To become a trusted, leading pet-care brand known for premium quality, responsible product development and a growing range of products that make better pet care accessible to pet owners.</p>
        </div>
      </section>

      {/* First product */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <img src={brand.logoUrl || "/images/petcare-logo.jpg"} alt="PetCare logo" loading="lazy" className="mx-auto h-full max-h-[420px] w-full object-contain p-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>Our first product</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Premium pet shampoo — a fresh start for happier pets</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">Our first product marks the beginning of the PetCare journey. It brings our focus on quality and pet well-being into an everyday grooming essential — because bath time should be more than a routine. It's an opportunity to care, connect and keep our companions feeling their best.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[["Premium pet care", "Developed with attention to quality and everyday grooming needs."], ["Pet-conscious formulation", "Guided by the safety and well-being of pets."], ["Everyday grooming", "Makes routine bathing part of a considered pet-care experience."], ["A growing commitment", "The first product in our journey to provide products for all things pets."]].map(([t, c]) => (
                <li key={t} className="rounded-2xl border border-border bg-white p-4">
                  <p className="font-display text-sm font-semibold text-ink">{t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c}</p>
                </li>
              ))}
            </ul>
            <Link to={shop} className="mt-8 inline-flex items-center rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: GREEN }}>
              Shop PetCare products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live products from the admin catalogue */}
      <BrandProductRail brand={brand} title="Shop PetCare" />

      {/* Values */}
      <section className="container mx-auto px-4 pb-6 pt-4">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>What we stand for</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Our core values</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: GREEN }}><v.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="container mx-auto px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>Our journey</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">From idea to first launch</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-4">
          {journey.map((j, i) => (
            <li key={j.when} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-4xl font-bold" style={{ color: `${GOLD}` }}>{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{j.when}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">{j.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{j.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Safety */}
      <section className="py-16" style={{ background: `${GREEN}0f` }}>
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ background: GREEN }}><ShieldCheck className="h-7 w-7" /></span>
            <h2 className="mt-5 font-display text-3xl font-bold text-ink sm:text-4xl">Because their well-being comes first</h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>At PetCare, we believe products made for pets should be developed with their unique needs in mind. Their safety and well-being are central to our approach to product research, formulation and quality.</p>
            <p>We're committed to thoughtful ingredient selection, responsible product development and high standards for the products we bring to market — and to honest information and a genuine understanding of the animals we serve.</p>
            <p>Our responsibility doesn't end when a product reaches the shelf. As our brand grows, we remain committed to learning, improving and finding better ways to support pets and the people who care for them.</p>
          </div>
        </div>
      </section>

      {/* Who it's for + closing CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl p-10 text-center text-white sm:p-14" style={{ background: `linear-gradient(135deg, ${GREEN}, #0b2e19)` }}>
          <Sparkles className="mx-auto h-8 w-8" style={{ color: GOLD }} />
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold sm:text-4xl">PetCare. Because every paw deserves a little more love.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">For dog owners who want to make grooming a better experience, families who care for their furry companions with confidence, and pet lovers who believe their animals deserve the same thought and attention as every other member of the household.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={shop} className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink transition hover:scale-[1.03]">Shop Pet Shampoo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            <Link to="/brands#petcare" className="inline-flex items-center rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">All Rekker brands</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
