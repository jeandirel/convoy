/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Route,
  Truck,
  Car,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Plus,
  Minus,
  Star,
  Globe2,
  KeyRound,
  PackageCheck,
  Quote as QuoteIcon,
} from "lucide-react";

const WHATSAPP_PHONE = "33760610880";

const openWhatsApp = (message) => {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const optionalLine = (label, value) => value ? `${label}: ${value}` : null;

/* ---------- Reveal on scroll ---------- */
const useReveal = () => {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ---------- HERO ---------- */
const Hero = () => (
  <section id="hero" className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28" data-testid="section-hero">
    <div className="absolute inset-0">
      <img
        src="/assets/images/hero-car.jpg"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(6,20,52,0.92) 0%, rgba(15,42,95,0.78) 50%, rgba(15,42,95,0.55) 100%)" }} />
    </div>
    <div className="grain" />

    <div className="relative max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm">
            <Sparkles size={14} className="text-[#E9C97C]" />
            <span>Nouveau · SIREN 105 299 457 — Maromme</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mt-6 tracking-tight">
            Votre véhicule,<br />
            <span className="italic" style={{ color: "#E9C97C" }}>livré en mains propres.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-white/85 max-w-xl leading-relaxed">
            GastyConvoy assure le convoyage, la livraison et la récupération de votre auto
            partout en France et à l'étranger. Un convoyeur qu'on voit — flexibilité,
            sécurité et suivi à chaque kilomètre.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#devis" className="btn-primary" data-testid="hero-cta-devis">
              Devis gratuit en 1 min <ArrowRight size={18} />
            </a>
            <a href="#services" className="btn-ghost-light" data-testid="hero-cta-services">
              Découvrir nos services
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { v: "100%", l: "Assuré & déclaré" },
              { v: "24h", l: "Réponse rapide" },
              { v: "🇪🇺", l: "France & Europe" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-2xl text-[#E9C97C]">{s.v}</div>
                <div className="text-xs uppercase tracking-wider text-white/65 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#2DA84F]/40 to-[#E9C97C]/20 blur-2xl rounded-[40px]" />
            <div className="relative rounded-[32px] overflow-hidden border-2 border-white/15 shadow-2xl">
              <img
                src="/assets/images/convoyage-car.jpg"
                alt="Convoyage voiture"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2DA84F] flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Convoyeur professionnel agréé</div>
                  <div className="text-white/70 text-xs">Permis B · Casier vierge · Discrétion garantie</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Trust marquee */}
    <div className="relative mt-16">
      <div className="overflow-hidden border-y border-white/10 bg-[#0A1F4A]/80 backdrop-blur">
        <div className="flex marquee-track py-4 whitespace-nowrap">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-12 px-6 text-white/70 font-display italic text-lg">
              {["Concessionnaires", "Loueurs", "Garages", "Particuliers", "Flottes d'entreprise", "Importateurs", "Carrossiers", "Mandataires"].map((t, i) => (
                <span key={i} className="flex items-center gap-12">
                  {t}
                  <span className="text-[#E9C97C]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---------- SERVICES ---------- */
const services = [
  {
    icon: KeyRound,
    title: "La conduite",
    desc: "Conducteur professionnel pour livrer votre véhicule en mains propres, où vous le souhaitez.",
    tag: "01",
  },
  {
    icon: Truck,
    title: "La livraison",
    desc: "Livraison de véhicules neufs ou d'occasion à votre client final, en temps et en heure.",
    tag: "02",
  },
  {
    icon: PackageCheck,
    title: "La récupération",
    desc: "Récupération de véhicules — fin de leasing, achat à distance, rapatriement, panne.",
    tag: "03",
  },
  {
    icon: Globe2,
    title: "Transport automobile",
    desc: "Transport et convoyage en France métropolitaine et dans toute l'Europe.",
    tag: "04",
  },
];

const Services = () => (
  <section id="services" className="relative py-24 lg:py-32" data-testid="section-services">
    <div className="max-w-7xl mx-auto px-6">
      <div className="reveal max-w-2xl">
        <span className="num-tag">001 — Services</span>
        <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
          Ce que je fais, <span className="italic" style={{ color: "#2DA84F" }}>vraiment bien.</span>
        </h2>
        <p className="mt-5 text-[#4F5B7A] text-lg">
          Quatre prestations claires, pensées pour les professionnels comme pour les particuliers
          qui veulent confier leur véhicule à quelqu'un de fiable.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="reveal group relative bg-white rounded-3xl p-7 border border-[#0F2A5F]/8 hover:border-[#2DA84F]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(15,42,95,0.25)]"
              style={{ transitionDelay: `${i * 80}ms` }}
              data-testid={`service-card-${i}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F2EA] flex items-center justify-center group-hover:bg-[#2DA84F] transition-colors">
                  <Icon size={22} className="text-[#0F2A5F] group-hover:text-white transition-colors" />
                </div>
                <span className="font-display italic text-2xl text-[#0F2A5F]/15 group-hover:text-[#2DA84F]/40 transition-colors">{s.tag}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl text-[#0F2A5F]">{s.title}</h3>
              <p className="mt-3 text-[#4F5B7A] leading-relaxed">{s.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2DA84F]">
                Demander un devis <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ---------- PROCESS ---------- */
const Process = () => (
  <section className="relative py-24 bg-[#F5F2EA]" data-testid="section-process">
    <div className="max-w-7xl mx-auto px-6">
      <div className="reveal max-w-2xl">
        <span className="num-tag">002 — Process</span>
        <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
          Simple, transparent, <span className="italic" style={{ color: "#2DA84F" }}>de A à Z.</span>
        </h2>
      </div>

      <div className="mt-14 grid md:grid-cols-4 gap-6 relative">
        <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-px border-t-2 border-dashed border-[#0F2A5F]/20" />
        {[
          { n: "01", t: "Demande de devis", d: "Vous décrivez votre besoin en 1 minute." },
          { n: "02", t: "Confirmation", d: "Devis personnalisé envoyé sous 24h." },
          { n: "03", t: "Convoyage", d: "Prise en charge soignée, suivi en temps réel." },
          { n: "04", t: "Livraison", d: "Remise en mains propres avec photos & PV." },
        ].map((p, i) => (
          <div key={i} className="reveal relative bg-white rounded-3xl p-7 border border-[#0F2A5F]/8" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="w-14 h-14 rounded-full bg-[#0F2A5F] text-white flex items-center justify-center font-display text-xl">
              {p.n}
            </div>
            <h3 className="mt-5 font-display text-xl text-[#0F2A5F]">{p.t}</h3>
            <p className="mt-2 text-[#4F5B7A] text-sm">{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- PRICING / QUOTE FORM ---------- */
const Tarifs = () => (
  <section id="tarifs" className="relative py-24 lg:py-32" data-testid="section-tarifs">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 reveal">
          <span className="num-tag">003 — Tarifs</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
            Tarification <span className="italic" style={{ color: "#2DA84F" }}>juste et claire.</span>
          </h2>
          <p className="mt-5 text-[#4F5B7A] text-lg leading-relaxed">
            Chaque trajet est unique. Je calcule un tarif personnalisé selon la distance,
            le type de véhicule, l'urgence et les éventuelles options. Pas de mauvaise surprise.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Devis gratuit sous 24h",
              "Forfait kilométrique transparent",
              "Frais de retour inclus",
              "Tarifs préférentiels pour les pros",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-[#0F2A5F]">
                <CheckCircle2 size={20} className="text-[#2DA84F] mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 reveal">
          <PricingGrid />
        </div>
      </div>
    </div>
  </section>
);

const PricingGrid = () => {
  const cards = [
    {
      title: "Local",
      sub: "Maromme & Rouen",
      from: "À partir de 60 €",
      bullets: ["Livraison locale", "Sous 24h", "Idéal garages & particuliers"],
      featured: false,
    },
    {
      title: "France",
      sub: "Toutes régions",
      from: "À partir de 0,55 €/km",
      bullets: ["Convoyage longue distance", "Photos & suivi", "Pros & particuliers"],
      featured: true,
    },
    {
      title: "Europe",
      sub: "International",
      from: "Sur devis",
      bullets: ["Belgique · Allemagne · Italie · Espagne", "Documents pris en charge", "Transport multimodal possible"],
      featured: false,
    },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`rounded-3xl p-6 border transition-all hover:-translate-y-1 ${
            c.featured
              ? "bg-[#0F2A5F] text-white border-[#0F2A5F] shadow-[0_30px_60px_-30px_rgba(15,42,95,0.6)]"
              : "bg-white text-[#0F2A5F] border-[#0F2A5F]/10"
          }`}
          data-testid={`tarif-card-${i}`}
        >
          {c.featured && (
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0F2A5F] bg-[#E9C97C] px-2.5 py-1 rounded-full mb-3">
              Populaire
            </div>
          )}
          <h3 className="font-display text-2xl">{c.title}</h3>
          <p className={`text-sm ${c.featured ? "text-white/65" : "text-[#4F5B7A]"}`}>{c.sub}</p>
          <div className={`mt-5 font-display text-xl ${c.featured ? "text-[#E9C97C]" : "text-[#2DA84F]"}`}>{c.from}</div>
          <ul className="mt-5 space-y-2 text-sm">
            {c.bullets.map((b, j) => (
              <li key={j} className="flex items-start gap-2">
                <CheckCircle2 size={16} className={c.featured ? "text-[#4BC76C] mt-0.5" : "text-[#2DA84F] mt-0.5"} />
                <span className={c.featured ? "text-white/85" : "text-[#4F5B7A]"}>{b}</span>
              </li>
            ))}
          </ul>
          <a
            href="#devis"
            className={`mt-7 inline-flex items-center gap-2 font-semibold text-sm ${
              c.featured ? "text-[#E9C97C]" : "text-[#2DA84F]"
            }`}
          >
            Demander mon devis <ArrowRight size={14} />
          </a>
        </div>
      ))}
    </div>
  );
};

/* ---------- ABOUT ---------- */
const About = () => (
  <section id="apropos" className="relative py-24 lg:py-32 bg-[#0F2A5F] text-white overflow-hidden" data-testid="section-about">
    <div className="absolute -top-32 -right-20 blob" style={{ background: "#2DA84F", width: 420, height: 420 }} />
    <div className="absolute -bottom-32 -left-20 blob" style={{ background: "#E9C97C", width: 360, height: 360, opacity: 0.25 }} />
    <div className="grain" />
    <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-5 reveal">
        <div className="relative">
          <img
            src="/assets/images/road.jpg"
            alt="Route et autoroute"
            className="rounded-[28px] shadow-2xl border-2 border-white/10 w-full h-[520px] object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-[#E9C97C] text-[#0F2A5F] rounded-3xl p-5 max-w-[240px] shadow-2xl">
            <div className="font-display text-3xl">2026</div>
            <div className="text-sm font-semibold mt-1">Lancement officiel de l'entreprise</div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 reveal">
        <span className="num-tag" style={{ color: "#E9C97C" }}>004 — À propos</span>
        <h2 className="font-display text-4xl md:text-5xl mt-4">
          Un convoyeur <span className="italic" style={{ color: "#E9C97C" }}>qu'on voit.</span>
        </h2>
        <p className="mt-6 text-white/85 text-lg leading-relaxed">
          Je m'appelle <strong className="text-white">Minko Mambi Franck</strong>, fondateur de GastyConvoy.
          Basé à Maromme (76), j'ai créé cette micro-entreprise avec une conviction simple :
          confier sa voiture à quelqu'un, ça ne se prend pas à la légère.
        </p>
        <p className="mt-4 text-white/80 leading-relaxed">
          Chaque convoyage que j'effectue, je le traite comme si la voiture était la mienne.
          Sérieux, ponctualité, communication transparente — et l'envie sincère de bien faire.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { k: "Flexibilité", v: "Adaptation à vos contraintes & délais" },
            { k: "Sécurité", v: "Conducteur déclaré, assurance pro" },
            { k: "Suivi", v: "Photos, géo-localisation, comptes-rendus" },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="font-display text-xl text-[#E9C97C]">{c.k}</div>
              <div className="text-sm text-white/75 mt-2">{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---------- ZONES ---------- */
const Zones = () => {
  const cities = [
    "Rouen", "Le Havre", "Caen", "Paris", "Lille", "Lyon", "Marseille",
    "Bordeaux", "Toulouse", "Strasbourg", "Nantes", "Nice",
  ];
  const intl = ["Belgique", "Allemagne", "Pays-Bas", "Italie", "Espagne", "Suisse", "Luxembourg"];
  return (
    <section id="zones" className="relative py-24 lg:py-32" data-testid="section-zones">
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal max-w-2xl">
          <span className="num-tag">005 — Zones d'intervention</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
            Maromme, la France, <span className="italic" style={{ color: "#2DA84F" }}>et bien au-delà.</span>
          </h2>
          <p className="mt-5 text-[#4F5B7A] text-lg">
            Au départ de Maromme (76), j'interviens dans toute la France et propose aussi du convoyage à l'international.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <div className="reveal bg-white rounded-3xl p-8 border border-[#0F2A5F]/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2DA84F] flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <h3 className="font-display text-2xl text-[#0F2A5F]">France métropolitaine</h3>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {cities.map((c, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-[#F5F2EA] text-[#0F2A5F] text-sm font-medium">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#4F5B7A]">… et toutes les communes intermédiaires.</p>
          </div>

          <div className="reveal bg-[#0F2A5F] text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 blob" style={{ background: "#E9C97C", width: 220, height: 220, opacity: 0.4 }} />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E9C97C] flex items-center justify-center">
                  <Globe2 size={18} className="text-[#0F2A5F]" />
                </div>
                <h3 className="font-display text-2xl">Europe & international</h3>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {intl.map((c, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-white/70">Convoyage routier ou multimodal selon vos besoins.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- TESTIMONIALS ---------- */
const testimonials = [
  {
    name: "Sophie L.",
    role: "Particulier · Rouen",
    text: "Franck a récupéré ma nouvelle voiture en Belgique et me l'a livrée à Maromme. Communication parfaite, photos à l'arrivée, je recommande sans hésitation.",
    rating: 5,
  },
  {
    name: "Garage Auto Plus",
    role: "Professionnel · Le Havre",
    text: "Un convoyeur de confiance pour nos livraisons clients. Ponctuel, soigneux, et toujours joignable. Devenu notre partenaire de référence.",
    rating: 5,
  },
  {
    name: "Marc D.",
    role: "Particulier · Paris",
    text: "Achat de mon utilitaire à Toulouse, ramené à Paris sans accroc. Tarif honnête et prestation pro. Un grand merci à GastyConvoy.",
    rating: 5,
  },
];

const Testimonials = () => (
  <section id="temoignages" className="relative py-24 lg:py-32 bg-[#F5F2EA]" data-testid="section-testimonials">
    <div className="max-w-7xl mx-auto px-6">
      <div className="reveal max-w-2xl">
        <span className="num-tag">006 — Témoignages</span>
        <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
          Ils m'ont fait <span className="italic" style={{ color: "#2DA84F" }}>confiance.</span>
        </h2>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="reveal relative bg-white rounded-3xl p-7 border border-[#0F2A5F]/10"
            style={{ transitionDelay: `${i * 100}ms` }}
            data-testid={`testimonial-${i}`}
          >
            <QuoteIcon size={28} className="text-[#2DA84F]/30" />
            <p className="mt-4 text-[#0F2A5F] leading-relaxed font-display text-lg">"{t.text}"</p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#0F2A5F]">{t.name}</div>
                <div className="text-sm text-[#4F5B7A]">{t.role}</div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-[#E9C97C] text-[#E9C97C]" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- FAQ ---------- */
const faqs = [
  {
    q: "Comment se déroule un convoyage ?",
    a: "Après validation du devis, je viens récupérer votre véhicule à l'adresse convenue. Un état des lieux contradictoire est réalisé (photos), puis je convoie le véhicule en respectant scrupuleusement le Code de la route. À l'arrivée, nouvel état des lieux et remise des clés.",
  },
  {
    q: "Quelle assurance pour mon véhicule ?",
    a: "Je dispose d'une assurance professionnelle dédiée au convoyage automobile. Votre véhicule est couvert pendant toute la durée de la prestation. Les justificatifs sont fournis sur demande.",
  },
  {
    q: "Quel est le délai pour obtenir un devis ?",
    a: "Vous recevez votre devis personnalisé sous 24 heures ouvrées maximum. Pour les demandes urgentes, n'hésitez pas à m'appeler directement au 07 60 61 08 80.",
  },
  {
    q: "Convoyez-vous tous types de véhicules ?",
    a: "Oui : citadines, berlines, SUV, utilitaires, véhicules de luxe ou de collection. Je m'adapte à chaque véhicule et à ses spécificités (boîte manuelle/auto, hybride, électrique).",
  },
  {
    q: "Travaillez-vous avec les professionnels ?",
    a: "Absolument. Concessionnaires, garages, loueurs, mandataires, importateurs… j'accompagne déjà plusieurs pros du secteur. Tarifs préférentiels pour les contrats récurrents.",
  },
  {
    q: "Et pour l'international ?",
    a: "Je convoie en Belgique, Allemagne, Pays-Bas, Italie, Espagne, Suisse et Luxembourg. Pour d'autres destinations européennes, contactez-moi pour étudier la faisabilité.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 lg:py-32" data-testid="section-faq">
      <div className="max-w-4xl mx-auto px-6">
        <div className="reveal text-center">
          <span className="num-tag justify-center inline-flex">007 — FAQ</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
            Vos questions, <span className="italic" style={{ color: "#2DA84F" }}>mes réponses.</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="reveal bg-white rounded-2xl border border-[#0F2A5F]/10 overflow-hidden"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                data-testid={`faq-toggle-${i}`}
              >
                <span className="font-display text-lg text-[#0F2A5F]">{f.q}</span>
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#F5F2EA] flex items-center justify-center text-[#0F2A5F]">
                  {open === i ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-[#4F5B7A] leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- QUOTE FORM ---------- */
const QuoteForm = () => {
  const initial = {
    name: "", email: "", phone: "", client_type: "particulier",
    service_type: "conduite", pickup_address: "", delivery_address: "",
    pickup_date: "", vehicle_brand: "", vehicle_model: "",
    vehicle_year: "", vehicle_fuel: "essence", notes: "",
  };
  const [data, setData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const message = [
      "Bonjour GastyConvoy, je souhaite recevoir un devis.",
      "",
      `Profil: ${data.client_type}`,
      `Service: ${data.service_type}`,
      `Nom: ${data.name}`,
      `Email: ${data.email}`,
      `Téléphone: ${data.phone}`,
      optionalLine("Date souhaitée", data.pickup_date),
      `Prise en charge: ${data.pickup_address}`,
      `Livraison: ${data.delivery_address}`,
      optionalLine("Véhicule", [data.vehicle_brand, data.vehicle_model, data.vehicle_year].filter(Boolean).join(" ")),
      optionalLine("Énergie", data.vehicle_fuel),
      optionalLine("Précisions", data.notes),
    ].filter(Boolean).join("\n");

    openWhatsApp(message);
    setSuccess(true);
    setData(initial);
    setSubmitting(false);
  };

  return (
    <section id="devis" className="relative py-24 lg:py-32 bg-[#0F2A5F] text-white overflow-hidden" data-testid="section-devis">
      <div className="absolute -top-32 -right-32 blob" style={{ background: "#2DA84F", width: 500, height: 500 }} />
      <div className="absolute -bottom-32 -left-32 blob" style={{ background: "#E9C97C", width: 420, height: 420, opacity: 0.3 }} />
      <div className="grain" />
      <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <span className="num-tag" style={{ color: "#E9C97C" }}>008 — Devis</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            Recevez votre devis<br />
            <span className="italic" style={{ color: "#E9C97C" }}>en moins de 24h.</span>
          </h2>
          <p className="mt-6 text-white/80 leading-relaxed">
            Remplissez le formulaire en quelques secondes. Je vous reviens personnellement
            avec une proposition claire, sans frais cachés.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { i: Clock, t: "Réponse sous 24h ouvrées" },
              { i: ShieldCheck, t: "Devis 100% gratuit et sans engagement" },
              { i: CheckCircle2, t: "Tarification transparente détaillée" },
            ].map((b, i) => {
              const Ic = b.i;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Ic size={14} className="text-[#E9C97C]" />
                  </div>
                  <span className="text-white/90 pt-1.5">{b.t}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={submit}
            className="bg-white rounded-3xl p-7 md:p-9 text-[#0F2A5F] shadow-2xl"
            data-testid="quote-form"
          >
            {success ? (
              <div className="text-center py-12" data-testid="quote-success">
                <div className="w-20 h-20 rounded-full bg-[#2DA84F]/15 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-[#2DA84F]" />
                </div>
                <h3 className="font-display text-3xl mt-6">Demande prête sur WhatsApp</h3>
                <p className="text-[#4F5B7A] mt-3">
                  WhatsApp vient de s’ouvrir avec votre demande préremplie. Envoyez le message pour finaliser votre demande.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-6 btn-outline"
                  data-testid="quote-success-reset"
                >
                  Faire une autre demande
                </button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Vous êtes</label>
                    <select className="field" value={data.client_type} onChange={(e) => update("client_type", e.target.value)} data-testid="quote-client-type">
                      <option value="particulier">Particulier</option>
                      <option value="professionnel">Professionnel</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Type de service</label>
                    <select className="field" value={data.service_type} onChange={(e) => update("service_type", e.target.value)} data-testid="quote-service-type">
                      <option value="conduite">Conduite / convoyage</option>
                      <option value="livraison">Livraison</option>
                      <option value="recuperation">Récupération</option>
                      <option value="transport">Transport plateau</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="field-label">Nom complet *</label>
                    <input required className="field" value={data.name} onChange={(e) => update("name", e.target.value)} data-testid="quote-name" />
                  </div>
                  <div>
                    <label className="field-label">Email *</label>
                    <input required type="email" className="field" value={data.email} onChange={(e) => update("email", e.target.value)} data-testid="quote-email" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="field-label">Téléphone *</label>
                    <input required className="field" value={data.phone} onChange={(e) => update("phone", e.target.value)} data-testid="quote-phone" />
                  </div>
                  <div>
                    <label className="field-label">Date souhaitée</label>
                    <input type="date" className="field" value={data.pickup_date} onChange={(e) => update("pickup_date", e.target.value)} data-testid="quote-date" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="field-label">Lieu de prise en charge *</label>
                    <input required className="field" placeholder="Ville, code postal" value={data.pickup_address} onChange={(e) => update("pickup_address", e.target.value)} data-testid="quote-pickup" />
                  </div>
                  <div>
                    <label className="field-label">Lieu de livraison *</label>
                    <input required className="field" placeholder="Ville, code postal" value={data.delivery_address} onChange={(e) => update("delivery_address", e.target.value)} data-testid="quote-delivery" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="field-label">Marque</label>
                    <input className="field" value={data.vehicle_brand} onChange={(e) => update("vehicle_brand", e.target.value)} data-testid="quote-brand" />
                  </div>
                  <div>
                    <label className="field-label">Modèle</label>
                    <input className="field" value={data.vehicle_model} onChange={(e) => update("vehicle_model", e.target.value)} data-testid="quote-model" />
                  </div>
                  <div>
                    <label className="field-label">Année</label>
                    <input className="field" value={data.vehicle_year} onChange={(e) => update("vehicle_year", e.target.value)} data-testid="quote-year" />
                  </div>
                  <div>
                    <label className="field-label">Énergie</label>
                    <select className="field" value={data.vehicle_fuel} onChange={(e) => update("vehicle_fuel", e.target.value)} data-testid="quote-fuel">
                      <option value="essence">Essence</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybride">Hybride</option>
                      <option value="electrique">Électrique</option>
                      <option value="gpl">GPL</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="field-label">Précisions (facultatif)</label>
                  <textarea rows={3} className="field" placeholder="Contraintes horaires, accessoires, demandes particulières…" value={data.notes} onChange={(e) => update("notes", e.target.value)} data-testid="quote-notes" />
                </div>

                {error && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm" data-testid="quote-error">{error}</div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#4F5B7A] max-w-md">
                    Ce formulaire ouvre WhatsApp avec votre demande préremplie. Aucune donnée n’est enregistrée sur le site pour le moment.
                  </p>
                  <button type="submit" disabled={submitting} className="btn-primary" data-testid="quote-submit">
                    {submitting ? "Ouverture…" : "Envoyer sur WhatsApp"}
                    {!submitting && <ArrowRight size={18} />}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

/* ---------- CONTACT ---------- */
const ContactSection = () => {
  const initial = { name: "", email: "", phone: "", subject: "", message: "" };
  const [data, setData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const message = [
      "Bonjour GastyConvoy, je vous contacte depuis le site.",
      "",
      `Nom: ${data.name}`,
      `Email: ${data.email}`,
      optionalLine("Téléphone", data.phone),
      optionalLine("Sujet", data.subject),
      `Message: ${data.message}`,
    ].filter(Boolean).join("\n");

    openWhatsApp(message);
    setSuccess(true);
    setData(initial);
    setSubmitting(false);
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32" data-testid="section-contact">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 reveal">
          <span className="num-tag">009 — Contact</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-[#0F2A5F]">
            Parlons de votre <span className="italic" style={{ color: "#2DA84F" }}>projet.</span>
          </h2>
          <p className="mt-5 text-[#4F5B7A] text-lg leading-relaxed">
            Une question, un besoin urgent, une demande spécifique ? Contactez-moi directement,
            je réponds rapidement et personnellement.
          </p>

          <div className="mt-10 space-y-5">
            <a href="tel:+33760610880" data-testid="contact-phone" className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#0F2A5F]/10 hover:border-[#2DA84F]/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#2DA84F]/12 flex items-center justify-center group-hover:bg-[#2DA84F] transition-colors">
                <Phone size={18} className="text-[#2DA84F] group-hover:text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#4F5B7A]">Téléphone</div>
                <div className="font-display text-xl text-[#0F2A5F] mt-0.5">07 60 61 08 80</div>
              </div>
            </a>

            <a href="mailto:f.gastyconvoy@gmail.com" data-testid="contact-email" className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#0F2A5F]/10 hover:border-[#2DA84F]/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#2DA84F]/12 flex items-center justify-center group-hover:bg-[#2DA84F] transition-colors">
                <Mail size={18} className="text-[#2DA84F] group-hover:text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#4F5B7A]">Email</div>
                <div className="font-display text-xl text-[#0F2A5F] mt-0.5 break-all">f.gastyconvoy@gmail.com</div>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#0F2A5F]/10">
              <div className="w-12 h-12 rounded-full bg-[#2DA84F]/12 flex items-center justify-center">
                <MapPin size={18} className="text-[#2DA84F]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#4F5B7A]">Adresse</div>
                <div className="font-display text-xl text-[#0F2A5F] mt-0.5">Rue Paul Painlevé<br />76150 Maromme</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 reveal">
          <form onSubmit={submit} className="bg-white rounded-3xl p-7 md:p-9 border border-[#0F2A5F]/10 shadow-[0_30px_60px_-30px_rgba(15,42,95,0.25)]" data-testid="contact-form">
            {success ? (
              <div className="text-center py-12" data-testid="contact-success">
                <div className="w-20 h-20 rounded-full bg-[#2DA84F]/15 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-[#2DA84F]" />
                </div>
                <h3 className="font-display text-3xl mt-6 text-[#0F2A5F]">Message prêt sur WhatsApp</h3>
                <p className="text-[#4F5B7A] mt-3">WhatsApp vient de s’ouvrir avec votre message prérempli. Envoyez-le pour lancer la discussion.</p>
                <button type="button" onClick={() => setSuccess(false)} className="mt-6 btn-outline" data-testid="contact-success-reset">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl text-[#0F2A5F]">Envoyez-moi un message</h3>
                <p className="text-[#4F5B7A] text-sm mt-1">Le formulaire ouvre WhatsApp avec votre message prérempli.</p>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="field-label">Nom *</label>
                    <input required className="field" value={data.name} onChange={(e) => update("name", e.target.value)} data-testid="contact-name" />
                  </div>
                  <div>
                    <label className="field-label">Email *</label>
                    <input required type="email" className="field" value={data.email} onChange={(e) => update("email", e.target.value)} data-testid="contact-form-email" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="field-label">Téléphone</label>
                    <input className="field" value={data.phone} onChange={(e) => update("phone", e.target.value)} data-testid="contact-form-phone" />
                  </div>
                  <div>
                    <label className="field-label">Sujet</label>
                    <input className="field" value={data.subject} onChange={(e) => update("subject", e.target.value)} data-testid="contact-subject" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="field-label">Message *</label>
                  <textarea required rows={5} className="field" value={data.message} onChange={(e) => update("message", e.target.value)} data-testid="contact-message" />
                </div>

                {error && <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm" data-testid="contact-error">{error}</div>}

                <button type="submit" disabled={submitting} className="btn-primary mt-6" data-testid="contact-submit">
                  {submitting ? "Ouverture…" : "Envoyer sur WhatsApp"}
                  {!submitting && <ArrowRight size={18} />}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};


const WhatsAppFloatingButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Bonjour GastyConvoy, je souhaite discuter de mon besoin de convoyage.")}`}
    target="_blank"
    rel="noreferrer"
    aria-label="Discuter sur WhatsApp"
    data-testid="whatsapp-floating-button"
    className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_20px_45px_-15px_rgba(37,211,102,0.75)] ring-[18px] ring-[#25D366]/10 hover:scale-105 hover:bg-[#1FBE5D] transition-transform"
  >
    <MessageCircle size={31} strokeWidth={2.4} />
  </a>
);

/* ---------- PAGE ---------- */
const Home = () => {
  useReveal();
  return (
    <div data-testid="home-page">
      <Hero />
      <Services />
      <Process />
      <Tarifs />
      <About />
      <Zones />
      <Testimonials />
      <FAQ />
      <QuoteForm />
      <ContactSection />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default Home;
