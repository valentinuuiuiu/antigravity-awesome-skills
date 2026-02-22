import paramiko
import sys

HOST = "163.245.213.254"
USER = "root"
PASS = "new_root_pass_2026"

files = {
    "/root/dating-app/src/app/api/send-message/route.ts": """import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres:new_root_pass_2026@localhost:5433/piata_db',
  ssl: false,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  try {
    const { matchId, content } = await request.json()

    if (!matchId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Verify match ownership
    const client = await pool.connect()
    try {
      const matchRes = await client.query(
        'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
        [matchId, user.id]
      )

      if (matchRes.rowCount === 0) {
        return NextResponse.json({ error: 'Match not found or access denied' }, { status: 403 })
      }

      const match = matchRes.rows[0]
      const receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id

      // Insert Message
      const insertRes = await client.query(
        `INSERT INTO messages (match_id, sender_id, receiver_id, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [matchId, user.id, receiverId, content]
      )

      return NextResponse.json(insertRes.rows[0])
    } finally {
      client.release()
    }
  } catch (err: any) {
    console.error('[send-message] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
""",
    "/root/dating-app/src/components/Chat.tsx": """'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers'
import { Send, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface Match {
  id: string
  user1_id: string
  user2_id: string
  // In real app, we would join with profiles to get name/photo
  // For now, simple ID display
}

export default function Chat() {
  const { supabase, session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !supabase) return

    // Fetch Matches
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
      setMatches(data || [])
      if (data && data.length > 0 && !selectedMatchId) {
        setSelectedMatchId(data[0].id)
      }
    }
    fetchMatches()
  }, [session, supabase])

  useEffect(() => {
    if (!selectedMatchId || !supabase) return

    // Fetch Messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', selectedMatchId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    }
    fetchMessages()

    // Subscribe
    const channel = supabase
      .channel(`chat:${selectedMatchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${selectedMatchId}`
      }, (payload: any) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedMatchId, supabase])

  const sendMessage = async () => {
    if (!newMessage.trim() || !session || !selectedMatchId) return

    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ matchId: selectedMatchId, content: newMessage })
    })

    if (response.ok) {
      setNewMessage('')
    } else {
        console.error("Failed to send message")
    }
  }

  if (!session) return <div>Please login to chat</div>

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar - Matches */}
      <div className="w-1/4 bg-neutral-900 border-r border-neutral-800 p-4">
        <h2 className="text-xl font-bold text-white mb-4">Matches</h2>
        <div className="space-y-2">
          {matches.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedMatchId === m.id ? 'bg-cyan-900/50 border border-cyan-500/50' : 'hover:bg-neutral-800'}`}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                <User className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Match {m.id.slice(0, 4)}</p>
                <p className="text-neutral-500 text-xs">Click to chat</p>
              </div>
            </button>
          ))}
          {matches.length === 0 && <p className="text-neutral-500 text-sm">No matches yet. Keep swiping!</p>}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-950">
        {selectedMatchId ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === session.user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender_id === session.user.id
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-800 bg-neutral-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-700 rounded-full text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            Select a match to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
"""
}

def upload_files():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS)

    sftp = client.open_sftp()

    for remote_path, content in files.items():
        print(f"Uploading {remote_path}...")
        with sftp.file(remote_path, 'w') as f:
            f.write(content)

    sftp.close()
    client.close()
    print("All files updated successfully.")

if __name__ == "__main__":
    upload_files()
