/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-[#061434] text-white pt-20 pb-8 overflow-hidden" data-testid="footer">
      <div className="absolute -top-32 -right-20 blob" style={{ background: "#2DA84F", width: 380, height: 380 }} />
      <div className="absolute -bottom-32 -left-20 blob" style={{ background: "#0F2A5F", width: 460, height: 460 }} />
      <div className="grain" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          <div className="lg:col-span-2 max-w-md">
            <Logo variant="light" size={32} />
            <p className="mt-6 text-white/70 leading-relaxed">
              GastyConvoy — Un convoyeur qu'on voit. Convoyage automobile professionnel pour
              particuliers et entreprises, partout en France et à l'étranger. Flexibilité, sécurité, suivi.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a aria-label="Instagram" href="#" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" data-testid="social-instagram"><Instagram size={16} /></a>
              <a aria-label="Facebook" href="#" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" data-testid="social-facebook"><Facebook size={16} /></a>
              <a aria-label="LinkedIn" href="#" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" data-testid="social-linkedin"><Linkedin size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg mb-5 text-[#E9C97C]">Contact</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-1 text-[#4BC76C]" />
                <a href="tel:+33760610880" className="hover:text-white" data-testid="footer-phone">07 60 61 08 80</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-1 text-[#4BC76C]" />
                <a href="mailto:f.gastyconvoy@gmail.com" className="hover:text-white break-all" data-testid="footer-email">f.gastyconvoy@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 text-[#4BC76C]" />
                <span>Rue Paul Painlevé<br />76150 Maromme, France</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-5 text-[#E9C97C]">Légal</h4>
            <ul className="space-y-3 text-white/80 text-sm">
              <li>SIREN : 105 299 457</li>
              <li>SIRET : 10529945700017</li>
              <li>Micro-entreprise</li>
              <li>Dirigeant : Minko Mambi Franck</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-sm text-white/50">
          <p>© {year} GastyConvoy. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="/admin" className="hover:text-white transition-colors" data-testid="footer-admin-link">Espace pro</a>
            <p className="font-display italic">Flexibilité · Sécurité · Suivi</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
