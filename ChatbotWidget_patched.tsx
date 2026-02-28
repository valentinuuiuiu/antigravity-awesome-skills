'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import axios from 'axios';

interface Message {
  text: string;
  sender: 'user' | 'fannymae';
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pageContext, setPageContext] = useState<string>('');

  // Capture page context on load and whenever URL changes
  useEffect(() => {
    const capturePageContext = () => {
      // Avoid capturing context from API routes or non-document pages
      if (typeof document !== 'undefined' && document.body) {
        // Limit context to prevent overloading the model
        const fullText = document.body.innerText;
        setPageContext(fullText.substring(0, 4000)); // Limit to ~4000 characters
      } else {
        setPageContext('');
      }
    };

    capturePageContext();

    // Re-capture on navigation changes (Next.js client-side routing)
    const handleRouteChange = () => {
      setTimeout(capturePageContext, 500); // Small delay to allow new content to render
    };

    window.addEventListener('popstate', handleRouteChange); // For browser back/forward
    // For Next.js router changes, typically handled by component re-mount or specific router events
    // For simplicity here, we'll rely on popstate and initial load.
    // A more robust solution might use useRouter from next/navigation and its events.

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Initial greeting from FannyMae
      setMessages([{ sender: 'fannymae', text: 'Salut! Sunt Fanny Mae, Suverana Pieței AI. Cu ce te pot ajuta astăzi?' }]);
    }
  };


  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      // Interceptare intenții specifice pieței
      const lowerMsg = userMessage.toLowerCase();

      // 1. Căutare anunțuri
      if (lowerMsg.includes('caut') || lowerMsg.includes('găsesc') || lowerMsg.includes('vreau să cumpăr')) {
        const query = encodeURIComponent(userMessage);
        try {
          const searchRes = await fetch(`/api/anunturi?q=${query}&limit=3`);
          if (searchRes.ok) {
            const data = await searchRes.json();
            if (data.anunturi && data.anunturi.length > 0) {
              const resultsText = "Uite ce am găsit:\n" + data.anunturi.map((a: any) => `- ${a.title} (${a.price} RON)\n  ${a.images?.[0] ? `[Imagine](${a.images[0]})` : ''}`).join('\n');
              setMessages((prev) => [...prev, { text: resultsText, sender: 'fannymae' }]);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Eroare la căutarea anunțurilor:", e);
        }
      }

      // 2. Sugestie de preț
      if (lowerMsg.includes('cât costă') || lowerMsg.includes('preț') || lowerMsg.includes('cât valorează') || lowerMsg.includes('evaluare')) {
         const parts = userMessage.split(' ');
         const potentialItem = parts.slice(Math.max(0, parts.indexOf('costă') + 1, parts.indexOf('preț') + 1)).join(' ');

         if (potentialItem.length > 3) {
           try {
             const priceRes = await fetch(`/api/price-suggest?title=${encodeURIComponent(potentialItem)}&category=diverse&location=România`);
             if (priceRes.ok) {
               const priceData = await priceRes.json();
               if (priceData.suggestedPrice) {
                 setMessages((prev) => [...prev, {
                   text: `Conform analizei mele, prețul recomandat pentru "${potentialItem}" este ${priceData.suggestedPrice} RON (între ${priceData.minPrice} și ${priceData.maxPrice} RON). ${priceData.insight}`,
                   sender: 'fannymae'
                 }]);
                 setIsLoading(false);
                 return;
               }
             }
           } catch (e) {
             console.error("Eroare la obținerea sugestiei de preț:", e);
           }
         }
      }

      // 3. Postare anunț
      if (lowerMsg.includes('postez') || lowerMsg.includes('adaug') || lowerMsg.includes('vând')) {
         setMessages((prev) => [...prev, { text: "Te pot ajuta să postezi un anunț! Mergi la secțiunea 'Adaugă Anunț' (butonul mare din meniu). Completează titlul și categoria, și apasă butonul 'Sugestie AI' la preț pentru a te ajuta să-l vinzi mai repede!", sender: 'fannymae' }]);
         setIsLoading(false);
         return;
      }

      // Fallback la API-ul FannyMae
      const response = await axios.post(
        'http://localhost:8000/api/agents/say', // Target FannyMae API
        {
          message: userMessage,
          persona: 'fannymae',
          page_context: pageContext, // Include page context
          model: 'moonshotai/kimi-k2.5', // Ensure we use Kimi
          system: "You are FannyMae, the AI assistant of piata-ai.ro Romanian marketplace. Help users find the best deals, post ads, and navigate the platform. Always respond in Romanian. You have access to real marketplace data."
        },
        {
          headers: {
            'X-Admin-Email': 'ionutbaltag3@gmail.com', // Bypass auth for testing
            'Content-Type': 'application/json',
          },
        }
      );


      const fannymaeResponse = response.data.response;
      setMessages((prev) => [...prev, { text: fannymaeResponse, sender: 'fannymae' }]);
    } catch (error) {
      console.error('FannyMae API error:', error);
      setMessages((prev) => [...prev, { text: 'Am întâmpinat o eroare. Te rog să încerci din nou.', sender: 'fannymae' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl shadow-xl flex flex-col border border-[#00f0ff]/30 text-white"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#00f0ff]/30">
              <h2 className="text-lg font-bold text-[#00f0ff]">Fanny Mae Chat</h2>
              <button onClick={toggleChat} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-[#00f0ff]/20 text-white'
                        : 'bg-[#1E293B] text-gray-300'
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 text-left">
                  <span className="inline-block px-4 py-2 rounded-lg bg-[#1E293B] text-gray-300">
                    Se gândește...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#00f0ff]/30 flex">
              <input
                type="text"
                className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-[#00f0ff] outline-none"
                placeholder="Scrie un mesaj..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    sendMessage();
                  }
                }}
              />
              <button
                className="ml-2 p-2 rounded-lg bg-[#00f0ff] text-black hover:bg-[#ff00f0] transition-colors"
                onClick={sendMessage}
                disabled={isLoading}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00f0ff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff00f0;
        }
      `}</style>
    </>
  );
};

export default ChatbotWidget;
