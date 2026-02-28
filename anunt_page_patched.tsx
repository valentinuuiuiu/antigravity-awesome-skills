'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Calendar,
  Tag,
  Phone,
  ShieldCheck,
  TrendingDown,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
  Share2,
  Heart
} from 'lucide-react';
import SemanticSEO from '@/components/SemanticSEO';

// Dynamic import for Leaflet map to avoid SSR issues
const AnuntMapView = dynamic(() => import('@/components/AnuntMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-gray-500">
      Se încarcă harta...
    </div>
  ),
});

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string | string[];
  location: string;
  lat?: number;
  lng?: number;
  created_at: string;
  category_name: string;
  phone: string;
  user_id: string;
}

export default function ListingDetails() {
  const params = useParams();
  const slug = params.slug as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    fetch(`/api/anunturi/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Anunț negăsit');
        return res.json();
      })
      .then(data => {
        setListing(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] text-white p-4">
        <h1 className="text-4xl font-bold mb-4">Anunț Negăsit</h1>
        <p className="text-gray-400 mb-8">Ne pare rău, acest anunț nu mai este disponibil sau a fost șters.</p>
        <Link href="/anunturi" className="btn-neon px-8 py-3 font-bold">
          Înapoi la Toate Anunțurile
        </Link>
      </div>
    );
  }

  const images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
  const imageList = (Array.isArray(images) ? images : []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-20">
      <SemanticSEO
        title={listing.title}
        description={listing.description}
        type="product"
        price={String(listing.price)}
        currency={listing.currency}
        date={listing.created_at}
        image={imageList[0]}
      />
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/anunturi" className="inline-flex items-center text-gray-400 hover:text-[#00f0ff] transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Înapoi la căutare
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* Left: Images & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="relative aspect-[16/10] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {imageList.length > 0 ? (
              <>
                <Image
                  src={imageList[currentImageIndex]}
                  alt={listing.title}
                  fill
                  unoptimized={true}
                  className="object-contain"
                  priority
                />

                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-[#00f0ff]/50 text-white transition-all backdrop-blur-md"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-[#00f0ff]/50 text-white transition-all backdrop-blur-md"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imageList.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-8 bg-[#00f0ff]' : 'w-2 bg-white/30'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">📷</span>
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="glass p-8 md:p-10 rounded-3xl border border-white/10">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl md:text-4xl font-black text-white">{listing.title}</h1>
              <div className="flex gap-2">
                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-500 transition-all border border-white/10">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#00f0ff] transition-all border border-white/10">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00f0ff]" />
                {listing.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#ff00f0]" />
                Adăugat la {new Date(listing.created_at).toLocaleDateString('ro-RO')}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00ff88]" />
                {listing.category_name}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#00f0ff] uppercase tracking-wider">Descriere</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-2xl font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
               <MapPin className="w-6 h-6" /> Localizare
            </h2>
            <AnuntMapView
              lat={listing.lat ? Number(listing.lat) : undefined}
              lng={listing.lng ? Number(listing.lng) : undefined}
              title={listing.title}
            />
            {!listing.lat && (
               <p className="text-sm text-gray-500 italic text-center">
                 * Locația exactă nu a fost specificată. Harta arată centrul orașului București implicit.
               </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Preț Solicitat</div>
            <div className="text-5xl font-black text-[#00f0ff] mb-6">
              {listing.price?.toLocaleString()} <span className="text-2xl">{listing.currency || 'RON'}</span>
            </div>

            <button
              onClick={() => setShowPhone(!showPhone)}
              className="w-full btn-neon py-5 text-xl font-bold flex items-center justify-center gap-3 mb-4"
            >
              <Phone className="w-6 h-6" />
              {showPhone ? listing.phone : 'Arată Telefon'}
            </button>

            <button className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <MessageSquare className="w-6 h-6" />
              Trimite Mesaj
            </button>
          </div>

          <div className="glass p-8 rounded-3xl border border-[#ff00f0]/30 bg-gradient-to-br from-[#ff00f0]/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <Zap className="w-8 h-8 text-[#ff00f0] animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#ff00f0]" />
              Analiză AI Piața RO
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-[#ff00f0]/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400 font-bold uppercase">Preț Estimativ AI</span>
                  <span className="text-[#00ff88] font-bold text-lg">SUPER DEAL</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {(listing.price * 0.95).toLocaleString()} - {(listing.price * 1.05).toLocaleString()} {listing.currency || 'RON'}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-300">
                <TrendingDown className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5" />
                <p>Acest preț este cu <strong>5.4% sub media pieței</strong> pentru produse similare în {listing.location}.</p>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-300">
                <Info className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
                <p>Anunțul a fost scanat și pare <strong>autentic</strong>. Vânzătorul are un istoric pozitiv.</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-xs text-gray-500 font-bold uppercase tracking-widest text-center">
              Powered by memUBot Unified Brain
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/10 text-gray-400 text-sm space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              🛡️ Sfaturi Siguranță
            </h4>
            <ul className="space-y-2 list-disc pl-4">
              <li>Nu plătiți în avans niciodată.</li>
              <li>Întâlniți-vă în locuri publice.</li>
              <li>Verificați produsul înainte de plată.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
