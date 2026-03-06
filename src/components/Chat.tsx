'use client'
import { Gift, MoreVertical, Search, MessageCircle, X, Sparkles, Send } from "lucide-react"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  read?: boolean
}

interface Match {
  id: string
  user1_id: string
  user2_id: string
  matched_user?: {
    id: string
    full_name: string
    avatar_url: string
    is_premium?: boolean
    is_verified?: boolean
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [showMatches, setShowMatches] = useState(true)
  const [typing, setTyping] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [showPremium, setShowPremium] = useState(false)
  const [isIncognito, setIsIncognito] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = 'ea7c45d5-0afa-4725-8ad0-352d15b97e92' // Demo user

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    if (selectedMatchId) {
      fetchMessages()
      // Simulate typing indicator
      const interval = setInterval(() => {
        setTyping(true)
        setTimeout(() => setTyping(false), 2000)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [selectedMatchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/match')
      const data = await res.json()
      setMatches(data || [])
      if (data?.length > 0 && !selectedMatchId) {
        setSelectedMatchId(data[0].id)
        setShowMatches(false)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchMessages = async () => {
    if (!selectedMatchId) return
    try {
      const res = await fetch('/api/messages?match_id=' + selectedMatchId)
      const data = await res.json()
      setMessages(data || [])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const sendMessage = async (content: string) => {
    if (!selectedMatchId || !content.trim()) return
    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatchId, content, senderId: currentUserId })
      })
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const sendGift = (gift: string) => {
    const gifts: Record<string, string> = {
      rose: '🌹 Te apreciez!',
      heart: '❤️ Te iubesc!',
      diamond: '💎 Ești special(ă)!',
      fire: '🔥 Ești fierbinte!',
      cake: '🎂 Ești dulce!',
      crown: '👑 Ești regele/regina mea!'
    }
    sendMessage(gifts[gift] || gift)
    setShowGifts(false)
  }

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex flex-col">
      {/* Header with Premium/Incognito */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedMatch && !showMatches && (
            <button onClick={() => setShowMatches(true)} className="p-2 text-white">
              ←
            </button>
          )}
          <h1 className="text-lg font-bold text-white">💕 Messages</h1>
          {isIncognito && <span className="text-yellow-400 text-sm">🙈</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            className={`p-2 rounded-full text-white flex items-center justify-center ${isIncognito ? 'bg-yellow-500' : 'bg-white/10'}`}

          >
            {isIncognito ? '🙈' : '👁️'}
          </button>
          <button
            onClick={() => setShowPremium(true)}
            className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center"

          >
            👑
          </button>
          <Link href="/swipe" className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white text-xs font-semibold">
            Discover
          </Link>
        </div>
      </div>

      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">⚡</span>
          <span className="text-white text-xs">⚡ 3 super likes available</span>
        </div>
        <button className="text-yellow-400 text-xs font-bold">UPGRADE</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Matches List */}
        <div className={`${showMatches ? 'flex' : 'hidden'} w-full md:flex md:w-72 flex-col bg-black/20 border-r border-white/10`}>
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/60 text-sm">{matches.length} potriviri</span>
            <div className="flex gap-1 items-center">
              <span className="text-pink-400">📍</span>
              <span className="text-xs text-pink-400">Nearby</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {matches.map(match => (
              <button
                key={match.id}
                onClick={() => { setSelectedMatchId(match.id); setShowMatches(false); }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-white/5 transition ${selectedMatchId === match.id ? 'bg-white/10 border-l-4 border-pink-500' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
                      {match.matched_user?.avatar_url ? (
                        <img src={match.matched_user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-pink-400">❤️</span>
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-neutral-900"></span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-white text-sm">{match.matched_user?.full_name || 'Unknown'}</p>
                    {match.matched_user?.is_premium && <span className="text-yellow-400">👑</span>}
                    {match.matched_user?.is_verified && <span className="text-cyan-400 text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-pink-300">💕 Match! • 2km away</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${showMatches ? 'hidden' : 'flex'} flex-1 flex-col`}>
          {selectedMatch ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-white/10 bg-black/20 flex items-center gap-3">
                <button onClick={() => setShowMatches(true)} className="p-1 md:hidden text-white">
                  ←
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-neutral-800 overflow-hidden">
                      {selectedMatch.matched_user?.avatar_url && (
                        <img src={selectedMatch.matched_user.avatar_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{selectedMatch.matched_user?.full_name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-green-400">● Online</p>
                    <span className="text-xs text-white/40">• 2km away</span>
                    {selectedMatch.matched_user?.is_premium && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs text-yellow-400">PREMIUM</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    🛡️
                  </button>
                  <button
                    onClick={() => setShowGifts(!showGifts)}
                    className="p-2 rounded-full bg-pink-600 text-white flex items-center justify-center"
                  >
                    🎁
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(msg => {
                  const isMe = msg.sender_id === currentUserId
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-2 rounded-xl ${
                        isMe
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-none'
                          : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-xs text-white/50">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isMe && (
                            <span className="text-xs">{msg.read ? '✓✓' : '✓'}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Typing Indicator */}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 p-3 rounded-xl flex gap-1">
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Gift Panel */}
              <AnimatePresence>
                {showGifts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 bg-black/30 p-3"
                  >
                    <p className="text-xs text-white/50 mb-2">🎁 Send a gift:</p>
                    <div className="flex gap-3 justify-center">
                      {[
                        { id: 'rose', emoji: '🌹', name: 'Rose' },
                        { id: 'heart', emoji: '❤️', name: 'Heart' },
                        { id: 'diamond', emoji: '💎', name: 'Diamond' },
                        { id: 'fire', emoji: '🔥', name: 'Fire' },
                        { id: 'cake', emoji: '🎂', name: 'Cake' },
                        { id: 'crown', emoji: '👑', name: 'Crown' }
                      ].map(gift => (
                        <button
                          key={gift.id}
                          onClick={() => sendGift(gift.id)}
                          className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition"
                        >
                          <span className="text-2xl">{gift.emoji}</span>
                          <span className="text-xs text-white/50">{gift.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="p-3 border-t border-white/10 bg-black/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGifts(!showGifts)}
                    className="p-2 rounded-full bg-pink-600 hover:bg-pink-500"
                  >
                    <Gift className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      const icebreakers = [
                        'Hei! 💕 Ce face ziua ta?',
                        'Mi-a plăcut profilul tău! 😊',
                        'Hey! Ce te-a adus aici? 🎯'
                      ]
                      icebreakers.forEach((text, i) => {
                        setTimeout(() => sendMessage(text), i * 500)
                      })
                    }}
                    className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"

                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                    placeholder="Scrie..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={() => sendMessage(newMessage)}
                    disabled={!newMessage.trim()}
                    className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl text-pink-400 mx-auto mb-3">❤️</div>
                <p className="text-white/60">Selectează o potrivire</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPremium(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-3xl max-w-sm w-full border border-yellow-500/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  👑
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Gem Dates Premium</h2>
                <p className="text-white/60">Devino #1 în dating!</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  '∞ Like-uri nelimitate',
                  '👁️ Vezi cine te-a likat',
                  '⭐ 5 Super Likes pe zi',
                  '📹 Video calls nelimitate',
                  '🎯 Priority în matching',
                  '🔓 Mod Incognito',
                  '💎 Verified Badge'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-white">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-bold text-lg mb-3">
                9.99€/lună
              </button>
              <button
                onClick={() => setShowPremium(false)}
                className="w-full text-white/40 text-sm hover:text-white"
              >
                Poate mai târziu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
