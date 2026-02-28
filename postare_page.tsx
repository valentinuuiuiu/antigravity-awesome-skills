'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, refreshClientSession } from '@/lib/auth-context';
import { Eye, EyeOff } from 'lucide-react';

function PostareAnuntContent() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    location: 'București',
    contact_phone: '',
    contact_email: '',
    show_email: false,
    images: [] as File[]
  });

  // Safety Timeout: Force page to load even if API/Auth hangs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        console.warn('Force loading completion due to timeout');
        setIsInitializing(false);
      }
    }, 5000); // 5 seconds max wait
    return () => clearTimeout(timer);
  }, [isInitializing]);

  // Auth & Initial Data Load
  useEffect(() => {
    let mounted = true;

    const initPage = async () => {
      if (authLoading) return; // Wait for auth to finish

      if (!user) {
        console.log('User not logged in, redirecting...');
        router.push('/autentificare');
        return;
      }

      // Pre-fill email
      if (user.email && !formData.contact_email) {
        setFormData(prev => ({ ...prev, contact_email: user.email! }));
      }

      try {
        console.log('Fetching categories...');
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();

        if (mounted) {
          setCategories(data);

          // Check query param for pre-selection
          const catParam = searchParams.get('category_id');
          if (catParam) {
            setFormData(prev => ({ ...prev, category_id: catParam }));
          }
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        // Don't block the page, just show error in console
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    initPage();

    return () => { mounted = false; };
  }, [authLoading, user, router, searchParams]);

  // Fetch Subcategories when Category Changes
  useEffect(() => {
    if (!formData.category_id) {
      setSubcategories([]);
      return;
    }

    fetch('/api/categories?format=tree')
      .then(res => res.json())
      .then(data => {
        const cat = data.find((c: any) => c.id === parseInt(formData.category_id));
        setSubcategories(cat?.subcategories || []);
      })
      .catch(err => console.error('Subcats error:', err));

  }, [formData.category_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.price.trim() || !formData.category_id) {
      alert('Te rog să completezi câmpurile obligatorii');
      return;
    }

    if (formData.images.length < 3) {
      alert('Te rog să selectezi cel puțin 3 imagini (pentru verificare AI)');
      return;
    }

    // Ensure we have a fresh access token. Try client-side refresh before aborting.
    let tokenToUse = session?.access_token;

    if (!tokenToUse) {
      try {
        const refreshed = await refreshClientSession();
        if (refreshed?.access_token) {
          tokenToUse = refreshed.access_token;
        } else {
          setError('Eroare autentificare: Sesiune expirată. Te rog să te reconectezi.');
          return;
        }
      } catch (refreshErr) {
        console.warn('Client session refresh failed:', refreshErr);
        setError('Eroare autentificare: Sesiune expirată. Te rog să te reconectezi.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category_id', formData.category_id);
      data.append('subcategory_id', formData.subcategory_id);
      data.append('location', formData.location);
      data.append('contact_phone', formData.contact_phone);
      data.append('contact_email', formData.contact_email);
      data.append('show_email', formData.show_email.toString());

      formData.images.forEach((img, i) => {
        data.append(`image_${i}`, img);
      });

      const headers: any = {};
      if (tokenToUse) headers['Authorization'] = `Bearer ${tokenToUse}`;

      const res = await fetch('/api/anunturi', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'A apărut o eroare la publicare');
      }

      // Success
      const listingId = result.id || result.listing?.id;
      if (!listingId) {
        throw new Error('Server returned invalid response (missing listing id)');
      }
      router.push(`/anunt/${listingId}`);

    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Eroare la trimiterea anunțului');
      setSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00f0ff] mb-4"></div>
          <p className="text-[#00f0ff] animate-pulse">Checking Permissions & Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !authLoading) return null;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] mb-8 text-center">
          POSTEAZĂ ANUNȚ NOU
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Titlu & Pret */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📝 Titlu Anunț</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-6 rounded-2xl bg-white/5 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
                placeholder="ex: BMW Seria 3 2020"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-4 text-[#00f0ff]">💶 Preț (EUR)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-6 rounded-2xl bg-white/5 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
                placeholder="ex: 15000"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📍 Locație</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/5 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
              required
            />
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-4 text-[#00f0ff]">🏷️ Categorie</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value, subcategory_id: '' }))}
                className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
                required
              >
                <option value="" className="bg-gray-900">Selectează</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📂 Subcategorie</label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory_id: e.target.value }))}
                className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
                disabled={!formData.category_id}
              >
                <option value="" className="bg-gray-900">Selectează</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id} className="bg-gray-900">{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📄 Descriere</label>
            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/5 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
              required
            />
          </div>

          {/* Contact */}
          <div className="bg-white/5 p-6 rounded-2xl border border-[#00f0ff]/20">
            <h3 className="text-xl font-bold text-[#00f0ff] mb-4">📞 Date de Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Telefon</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="w-full p-4 rounded-xl bg-black/20 border border-[#00f0ff]/30 text-white"
                  placeholder="07xx xxx xxx"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full p-4 rounded-xl bg-black/20 border border-[#00f0ff]/30 text-white"
                  placeholder="email@example.com"
                />
                <div
                  className="mt-3 flex items-center space-x-3 cursor-pointer group"
                  onClick={() => setFormData(prev => ({ ...prev, show_email: !prev.show_email }))}
                >
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.show_email ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.show_email ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                    {formData.show_email ? (
                      <span className="flex items-center text-green-400"><Eye className="w-4 h-4 mr-1"/> Email-ul va fi vizibil</span>
                    ) : (
                      <span className="flex items-center text-gray-400"><EyeOff className="w-4 h-4 mr-1"/> Email-ul este ascuns</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">�� Imagini (minim 3)</label>
            <div className="border-2 border-dashed border-[#00f0ff]/30 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []) as File[];
                  if (files.length === 0) return;

                  // Compress images client-side to avoid gateway 413 errors
                  const compressImage = async (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.95): Promise<File> => {
                    try {
                      const img = new Image();
                      const objectUrl = URL.createObjectURL(file);
                      img.src = objectUrl;

                      await new Promise((res, rej) => {
                        img.onload = res;
                        img.onerror = rej;
                      });

                      let width = img.naturalWidth;
                      let height = img.naturalHeight;
                      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                      const w = Math.round(width * ratio);
                      const h = Math.round(height * ratio);

                      const canvas = document.createElement('canvas');
                      canvas.width = w;
                      canvas.height = h;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) throw new Error('Canvas not supported');
                      ctx.drawImage(img, 0, 0, w, h);

                      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
                      URL.revokeObjectURL(objectUrl);
                      if (!blob) throw new Error('Failed to compress image');

                      const newName = (file.name && file.name.replace(/\.[^.]+$/, '.jpg')) || `image-${Date.now()}.jpg`;
                      return new File([blob], newName, { type: 'image/jpeg' });
                    } catch (err) {
                      console.warn('Image compression failed, using original file', err);
                      return file;
                    }
                  };

                  try {
                    const compressed = await Promise.all(files.map(f => compressImage(f)));
                    setFormData(prev => ({ ...prev, images: [...prev.images, ...compressed].slice(0, 8) }));
                  } catch (err) {
                    console.error('Image compression unexpected error, falling back', err);
                    setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 8) }));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-gray-400">Trage imaginile aici sau dă click pentru a încărca</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-[#00f0ff]/20">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-neon py-6 text-2xl font-black shadow-[0_0_30px_rgba(0,240,255,0.5)] bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-black rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? 'SE PUBLICĂ...' : 'PUBLICĂ ANUNȚUL ACUM!'}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function PostarePage() {
  return (
    <Suspense fallback={<div className="text-white p-10 text-center">Incarcare modul postare...</div>}>
      <PostareAnuntContent />
    </Suspense>
  );
}
