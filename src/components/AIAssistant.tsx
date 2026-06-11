import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ArrowUpRight, MessageCircle, Mic, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onTriggerAction: (actionType: string, payload: string) => void;
  currentTab: string;
}

const suggestionChips = [
  { text: "Find highest-rated food", action: "Find the highest-rated food on campus" },
  { text: "How to go to Sports Centre?", action: "How do I get to Sports Centre?" },
  { text: "Book seat to Main Gate", action: "Book a seat on the next bus to Main Gate" },
  { text: "Affordable print shops", action: "Find me affordable printing shops near Faculty of Science" }
];

export default function AIAssistant({ onTriggerAction, currentTab }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your **FINDIN Intelligent Campus Navigator** 🌟.\n\nAsk me anything about UNILAG locations, academic faculties, local food joint ratings, or catch a bus in real-time.\n\nTry asking: *\"Book a seat on the next bus to Main Gate\"* or *\"Show me spots near Lagoon Front\"*!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle parsing tags from Gemini response
  const parseActionTags = (text: string) => {
    // Regex to find match of type [ACTION:TYPE|PAYLOAD]
    const actionRegex = /\[ACTION:([A-Z_]+)\|([^\]]+)\]/g;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      const actionType = match[1];
      const payload = match[2];

      // Trigger the handler callback automatically (delay so user can read first)
      setTimeout(() => {
        onTriggerAction(actionType, payload);
      }, 800);
    }

    // Keep action tags intact inside text so renderMessageText can convert them into gorgeous buttons!
    return text;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = Math.random().toString(36).substring(7);
    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build simple Gemini historic array containing last 5 interactions
      const chatHistory = messages
        .filter(m => m.id !== 'welcome') // ignore large initial message
        .slice(-5)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error('API server failed');
      }

      const data = await response.json();
      const rawText = data.text || "I was unable to retrieve a response. Please check your internet connectivity.";
      const parsedText = parseActionTags(rawText);

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          text: parsedText,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          text: "I am having temporary trouble reaching the FINDIN Cloud Core right now. Ensure standard server.ts is active, and try again! 🌴",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Conversation refreshed. Ask me to navigate locations, suggest menus, find repair shops, or reserve seats on any shuttle active today!",
        timestamp: new Date()
      }
    ]);
  };

  // Helper to format inline styling (**bold**, *italic*, `code`, or [ACTION:TYPE|PAYLOAD])
  const parseInlineStyles = (text: string) => {
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[ACTION:[A-Z_]+\|[^\]]+\])/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-black bg-red-50/70 px-0.5 rounded-sm">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return (
          <em key={idx} className="italic text-neutral-800">
            {token.slice(1, -1)}
          </em>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={idx} className="bg-neutral-100 text-red-600 font-mono text-[11px] px-1.5 py-0.5 rounded border border-neutral-200 mx-0.5">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('[ACTION:') && token.endsWith(']')) {
        const match = token.match(/\[ACTION:([A-Z_]+)\|([^\]]+)\]/);
        if (match) {
          const type = match[1];
          const payload = match[2];

          let actionText = "Execute Action";
          let icon = "✨";

          if (type === 'SHOW_LOCATION') {
            actionText = `View ${payload.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
            icon = "📍";
          } else if (type === 'SHOW_VENDOR') {
            actionText = `View Vendor ${payload.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
            icon = "🛍️";
          } else if (type === 'BOOK_SHUTTLE') {
            actionText = `Book Bus: ${payload}`;
            icon = "🚌";
          } else if (type === 'NAVIGATE') {
            actionText = `Go to Tab: ${payload}`;
            icon = "↗️";
          }

          return (
            <button
              key={idx}
              onClick={() => onTriggerAction(type, payload)}
              className="inline-flex items-center gap-1.5 my-1 mx-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-[11px] rounded-xl transition-all cursor-pointer shadow-sm hover:translate-y-[-1px] hover:shadow-md hover:shadow-red-600/25 active:translate-y-[1px] select-none"
            >
              <span>{icon}</span>
              <span>{actionText}</span>
            </button>
          );
        }
      }
      return token;
    });
  };

  // Helper to format basic markdown, lists, and headers in string
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let currentListItems: React.ReactNode[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    
    const flushList = (key: number) => {
      if (currentListType === 'ul' && currentListItems.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-1.5 space-y-1 block text-neutral-800 text-left">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
        currentListType = null;
      } else if (currentListType === 'ol' && currentListItems.length > 0) {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-1.5 space-y-1 block text-neutral-800 text-left">
            {currentListItems}
          </ol>
        );
        currentListItems = [];
        currentListType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
      const numberedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (bulletMatch) {
         if (currentListType !== 'ul') {
           flushList(index);
           currentListType = 'ul';
         }
         const itemContent = bulletMatch[2];
         currentListItems.push(
           <li key={`li-${index}`} className="leading-relaxed text-sm text-left">
             {parseInlineStyles(itemContent)}
           </li>
         );
      } else if (numberedMatch) {
         if (currentListType !== 'ol') {
           flushList(index);
           currentListType = 'ol';
         }
         const itemContent = numberedMatch[2];
         currentListItems.push(
           <li key={`li-${index}`} className="leading-relaxed text-sm text-left">
             {parseInlineStyles(itemContent)}
           </li>
         );
      } else {
         flushList(index);
         if (trimmedLine) {
           const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
           if (headerMatch) {
             const depth = headerMatch[1].length;
             const headerText = headerMatch[2];
             const className = depth === 1 ? 'text-base font-black text-black mt-3 mb-1.5 block' :
                               depth === 2 ? 'text-sm font-black text-red-600 mt-2 mb-1 block' :
                                             'text-xs font-extrabold text-neutral-900 mt-1.5 mb-0.5 block';
             elements.push(
               <span key={index} className={`${className} text-left`}>
                 {parseInlineStyles(headerText)}
               </span>
             );
           } else {
             elements.push(
               <p key={index} className="mb-1.5 leading-relaxed text-sm text-left">
                 {parseInlineStyles(line)}
               </p>
             );
           }
         } else {
           elements.push(<div key={index} className="h-1.5" />);
         }
      }
    });
    
    flushList(lines.length);
    
    return <div className="space-y-0.5 flex flex-col justify-start align-top text-left">{elements}</div>;
  };

  // Skip rendering floating AI Assistant on Profile tab directly as requested
  if (currentTab === 'Profile') return null;

  return (
    <>
      {/* Floating launcher trigger circle button */}
      <motion.button
        id="ai-launcher"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:right-8 z-40 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-red-100 transition-all outline-none"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={24} className="text-amber-400 animate-pulse" />
      </motion.button>

      {/* Primary Side Drawer Chat interface */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel interface */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-neutral-200"
            >
              {/* Header Box */}
              <div className="p-4 bg-white border-b border-neutral-150 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-display font-extrabold text-black leading-none">
                      FINDIN Assistant
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-display font-extrabold mt-1 flex items-center gap-1 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Online • UNILAG Guide OS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Clear conversation */}
                  <button
                    onClick={clearChat}
                    title="Refresh Chat"
                    className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={16} />
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Message Arena Scroller */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs leading-relaxed text-sm ${
                        msg.sender === 'user'
                          ? 'bg-neutral-950 text-neutral-50 rounded-br-xs shadow-md shadow-black/10 text-left'
                          : 'bg-white border border-neutral-150 text-neutral-800 rounded-bl-xs text-left'
                      }`}
                    >
                      {/* Avatar indicator inside text if AI */}
                      {msg.sender === 'assistant' && msg.id === 'welcome' && (
                        <div className="text-[9px] font-display font-extrabold tracking-wider text-red-600 mb-1.5 uppercase">
                          SYSTEM BOOT SUCCESSFUL
                        </div>
                      )}
                      
                      {renderMessageText(msg.text)}

                      <span
                        className={`text-[9px] mt-1.5 block text-right font-semibold ${
                          msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Simulated Loading Typing Bubble */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-150 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips sliding tray */}
              <div className="px-4 py-2 bg-white/50 border-t border-neutral-150 overflow-x-auto whitespace-nowrap shrink-0 flex gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => !isLoading && handleSendMessage(chip.action)}
                    className={`bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-full px-3 py-1 text-xs text-neutral-700 hover:text-neutral-950 transition-all shadow-2xs font-display font-extrabold cursor-pointer shrink-0 flex items-center gap-1 ${
                      isLoading ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{chip.text}</span>
                    <ArrowUpRight size={12} className="opacity-40" />
                  </button>
                ))}
              </div>

              {/* User input controller Box */}
              <div className="p-4 bg-white border-t border-neutral-150 shrink-0">
                <div className="flex items-center gap-2 p-1 bg-neutral-50 border border-neutral-200 rounded-xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-100 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={inputMessage}
                    aria-label="Ask about spots"
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    placeholder="Ask about spots, printing shops, or bus routes..."
                    className="flex-1 px-3 py-2 text-sm bg-transparent border-none outline-none text-neutral-900 placeholder-neutral-400"
                    disabled={isLoading}
                  />

                  {/* Send button trigger */}
                  <button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow'
                        : 'bg-neutral-100 text-neutral-400 cursor-default'
                    }`}
                  >
                    <Send size={14} className="stroke-white" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-neutral-400 mt-2">
                  FINDIN AI is powered by Gemini 2.5. Responses may execute UI actions natively.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
