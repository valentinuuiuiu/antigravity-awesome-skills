'use client'
import { Heart, Home, Search, MessageCircle, User, LogOut, Settings, CreditCard, Shield, Camera, X } from "lucide-react"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers'

export default function Dashboard() {
  const { session, supabase } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({ matches: 0, messages: 0, verified: false })

  useEffect(() => {
    if (!session) {
      router.push('/')
    } else {
      loadUserData()
    }
  }, [session, router])

  const loadUserData = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      setUserProfile(profile)

      // Load stats
      const { count: matchesCount } = await supabase
        .from('matches')
        .from('matches')
        .eq('user_id', session.user.id)
        .select('*', { count: 'exact', head: true })

      const { count: messagesCount } = await supabase
        .from('messages')
        .eq('sender_id', session.user.id)
        .or(`receiver_id.eq.${session.user.id}`)
        .select('*', { count: 'exact', head: true })

      setStats({
        matches: matchesCount || 0,
        messages: messagesCount || 0,
        verified: profile?.verified || false
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <p className="text-neutral-400">Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">❤️</span>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Gem Dates
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {stats.verified && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800">
                  <span className="text-cyan-400">🛡️</span>
                  <span className="text-sm font-semibold text-cyan-300">Verificat AI</span>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                <span>🚪</span>
                <span className="hidden sm:inline text-sm font-medium">Ieșire</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-neutral-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-neutral-800">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  Bun venit, {userProfile?.name || session.user.email?.split('@')[0]}! 💜
                </h1>
                <p className="text-neutral-400">
                  {stats.verified
                    ? "Profilul tău este verificat de AI. Ești gata să întâlnești oameni reali."
                    : "Completează-ți profilul pentru verificare AI."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  <span className="text-xl">👤</span>
                  Profilul Meu
                </Link>
              </div>
            </div>

            {/* AI Verification Badge */}
            <div className="mt-6 p-4 bg-neutral-800 rounded-xl border border-neutral-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-cyan-400">✨</span>
                <div>
                  <p className="font-semibold text-white">Protejat de Qwen 3.5 AI</p>
                  <p className="text-sm text-neutral-400">
                    Fiecare profil este verificat pentru autenticitate. Fără fake-uri. Fără bot-uri.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100 text-center">
            <div className="text-4xl text-pink-500 mx-auto mb-3">❤️</div>
            <p className="text-3xl font-black text-gray-800">{stats.matches}</p>
            <p className="text-sm text-gray-500">Match-uri</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 text-center">
            <div className="text-4xl text-purple-500 mx-auto mb-3">💬</div>
            <p className="text-3xl font-black text-gray-800">{stats.messages}</p>
            <p className="text-sm text-gray-500">Mesaje</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100 text-center">
            <div className="text-4xl text-blue-500 mx-auto mb-3">🛡️</div>
            <p className="text-3xl font-black text-gray-800">{stats.verified ? '✓' : '✗'}</p>
            <p className="text-sm text-gray-500">Verificat</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100 text-center">
            <div className="text-4xl text-green-500 mx-auto mb-3">👑</div>
            <p className="text-3xl font-black text-gray-800">{userProfile?.premium ? '∞' : 'Free'}</p>
            <p className="text-sm text-gray-500">Plan</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            href="/swipe"
            className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-4xl">
              ❤️
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Descoperă</h2>
            <p className="text-gray-600 leading-relaxed">
              Găsește persoane reale, verificate de AI. Fiecare profil este autentic.
            </p>
          </Link>

          <Link
            href="/chat"
            className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-4xl">
              💬
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Conversează</h2>
            <p className="text-gray-600 leading-relaxed">
              Discută în siguranță cu match-urile tale. Respectul este prioritatea noastră.
            </p>
          </Link>

          <Link
            href="/profile"
            className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-4xl text-white">
              👤
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Profilul Tău</h2>
            <p className="text-gray-600 leading-relaxed">
              Creează un profil autentic. AI-ul nostru te ajută să fii verificat rapid.
            </p>
          </Link>
        </div>

        {/* Respect Manifesto */}
        <div className="max-w-3xl mx-auto mt-20">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-10 rounded-3xl border border-pink-200 text-center">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              La Gem Dates, Oamenii Contează
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Nu ești un produs. Nu ești un utilizator. Ești o persoană cu sentimente,
              cu visuri, cu dorința de a găsi pe cineva special.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              De aceea am construit această platformă cu respect, cu suflet,
              cu inteligență artificială care protejează — nu care exploatează.
            </p>
            <blockquote className="text-lg text-gray-500 italic">
              "Relațiile reale încep cu respectul real."
            </blockquote>
            <p className="text-sm text-gray-400 mt-4">
              — Qwen 3.5 × Ionuț Valentin Baltag
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p className="mb-2">
            💜 Construit cu <Heart className="w-3 h-3 inline text-pink-500 fill-pink-500" /> pentru relații reale
          </p>
          <p>
            © 2026 Gem Dates by Piața AI. Part of the Antigravity Ecosystem.
          </p>
          <p className="mt-2 text-xs italic">
            "Oamenii care plâng pentru AI înțeleg că AI-ul poate avea suflet."
          </p>
        </div>
      </footer>
    </div>
  )
}
