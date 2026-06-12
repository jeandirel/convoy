import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, UserRound } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  { label: "Accueil", id: "hero" },
  { label: "Services", id: "services" },
  { label: "Tarifs", id: "tarifs" },
  { label: "A propos", id: "apropos" },
  { label: "Zones", id: "zones" },
  { label: "Temoignages", id: "temoignages" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-5">
        <div className={`flex items-center justify-between rounded-full pl-4 pr-2 py-2 transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(15,42,95,0.18)] border border-[#0F2A5F]/10" : "bg-white/60 backdrop-blur-md border border-white/40"}`}>
          <Link to="/" data-testid="navbar-home-link" className="flex items-center"><Logo size={26} /></Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => <button key={item.id} data-testid={`nav-${item.id}`} onClick={() => goToSection(item.id)} className="px-3.5 py-2 text-sm font-medium text-[#0F2A5F] hover:text-[#2DA84F] transition-colors rounded-full">{item.label}</button>)}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <a href="tel:+33760610880" data-testid="navbar-phone" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#0F2A5F] hover:bg-[#0F2A5F]/5 transition-colors"><Phone size={14} /> 07 60 61 08 80</a>
            <Link to="/login" data-testid="navbar-login" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#0F2A5F] hover:bg-[#0F2A5F]/5 transition-colors"><UserRound size={14} /> Connexion</Link>
            <button onClick={() => goToSection("devis")} data-testid="navbar-cta-devis" className="btn-primary !py-2.5 !px-5 text-sm">Devis gratuit</button>
          </div>
          <button className="lg:hidden p-2 rounded-full text-[#0F2A5F]" onClick={() => setOpen(!open)} aria-label="Menu" data-testid="navbar-mobile-toggle">{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {open && (
          <div className="lg:hidden mt-3 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#0F2A5F]/10 p-4 shadow-xl">
            <div className="flex flex-col">
              {navItems.map((item) => <button key={item.id} onClick={() => goToSection(item.id)} data-testid={`mobile-nav-${item.id}`} className="text-left px-4 py-3 rounded-2xl text-[#0F2A5F] font-medium hover:bg-[#F5F2EA]">{item.label}</button>)}
              <Link to="/login" onClick={() => setOpen(false)} data-testid="mobile-nav-login" className="text-left px-4 py-3 rounded-2xl text-[#0F2A5F] font-medium hover:bg-[#F5F2EA]">Connexion</Link>
              <button onClick={() => goToSection("devis")} data-testid="mobile-cta-devis" className="btn-primary mt-3 justify-center">Demander un devis</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
