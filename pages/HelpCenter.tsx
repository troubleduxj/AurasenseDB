
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Book, Code, MessageCircle, LifeBuoy, FileText, Video, ExternalLink, 
  Plus, Send, Bot, User, MessageSquare, Trash2, Sparkles, MoreHorizontal, History 
} from 'lucide-react';
import { Page } from '../types';

// --- Types ---
interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// --- Mock Data ---
const MOCK_SESSIONS: ChatSession[] = [
  { id: 's1', title: 'Kafka Ingestion Latency', updatedAt: '10 mins ago', preview: 'How do I optimize Kafka consumer lag?' },
  { id: 's2', title: 'SQL Syntax Error', updatedAt: '2 hours ago', preview: 'Error code 0x203 in aggregated query.' },
  { id: 's3', title: 'Cluster Expansion', updatedAt: 'Yesterday', preview: 'Steps to add a new DNode to the cluster.' },
  { id: 's4', title: 'Data Retention Policy', updatedAt: '2 days ago', preview: 'Can I set different TTL for specific tables?' },
  { id: 's5', title: 'Grafana Plugin Setup', updatedAt: '3 days ago', preview: 'Where to find the datasource URL?' },
];

const MOCK_MESSAGES_S1: ChatMessage[] = [
  { id: 'm1', role: 'user', content: 'How do I optimize Kafka consumer lag in TDengine?', timestamp: '10:23 AM' },
  { id: 'm2', role: 'assistant', content: 'To optimize Kafka consumer lag in TDengine, you can tune the following configurations in your `taosAdapter` or consumer plugin:\n\n1. Increase `batchSize`: Processing larger batches reduces network overhead.\n2. Adjust `workers`: Increase the number of consumer threads to process partitions in parallel.\n3. Check `walLevel`: Ensure TDengine WAL writing isnt the bottleneck.\n\nWould you like to see a configuration example?', timestamp: '10:23 AM' },
  { id: 'm3', role: 'user', content: 'Yes, please show me a config example for high throughput.', timestamp: '10:24 AM' },
  { id: 'm4', role: 'assistant', content: 'Here is an optimized configuration snippet for `plugins.json`:\n\n```json\n{\n  "name": "kafka-consumer",\n  "config": {\n    "batchSize": 5000,\n    "workers": 8,\n    "pollTimeout": 100\n  }\n}\n```\n\nMake sure your TDengine server has enough memory to handle the increased batch size.', timestamp: '10:24 AM' },
];

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'home' | 'chat'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages when switching sessions
  useEffect(() => {
    if (activeSessionId === 's1') {
      setMessages(MOCK_MESSAGES_S1);
    } else if (activeSessionId) {
      // Mock loading other sessions
      const session = sessions.find(s => s.id === activeSessionId);
      setMessages([
        { id: 'init', role: 'user', content: session?.preview || 'Hello', timestamp: 'Previous' },
        { id: 'init_r', role: 'assistant', content: 'This is a archived conversation history.', timestamp: 'Previous' }
      ]);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, viewMode]);

  // Handle Search from Home Page
  const handleHomeSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      startNewChat(searchQuery);
    }
  };

  const startNewChat = (initialQuery?: string) => {
    const newId = `s_${Date.now()}`;
    const newSession: ChatSession = {
        id: newId,
        title: initialQuery || 'New Conversation',
        updatedAt: 'Just now',
        preview: initialQuery || 'New chat started'
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([]);
    setViewMode('chat');

    if (initialQuery) {
        // Add user message
        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: initialQuery,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([userMsg]);
        
        // Simulate AI Response
        setIsTyping(true);
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: `ai_${Date.now()}`,
                role: 'assistant',
                content: `I found several resources related to "${initialQuery}". \n\nCould you specify if you are looking for configuration guides, API references, or troubleshooting steps?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Mock AI Reply
    setTimeout(() => {
        setIsTyping(false);
        const aiMsg: ChatMessage = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: "That's a great question. Based on the documentation, you should check the `taos.cfg` file on your management node. \n\nLook for the `walLevel` parameter.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
    }, 2000);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
          setActiveSessionId(null);
          setMessages([]);
      }
  };

  // --- Render Home View ---
  if (viewMode === 'home') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Hero */}
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-gray-700 text-center px-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
              
              <div className="bg-blue-600/20 p-4 rounded-full mb-6 border border-blue-500/30 shadow-xl shadow-blue-500/10 relative z-10">
                  <Bot className="w-10 h-10 text-blue-400" />
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 relative z-10">
                  TDengine <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI Assistant</span>
              </h1>
              <p className="text-gray-400 mb-8 max-w-lg text-lg relative z-10">
                  Ask anything about configuration, SQL syntax, or troubleshooting.
              </p>
              
              <div className="relative w-full max-w-2xl z-10 group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 group-focus-within:animate-pulse" />
                  <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleHomeSearch}
                      placeholder="Ask a question (e.g., 'How to optimize write speed?')" 
                      className="w-full bg-gray-900/90 border border-gray-600 rounded-xl pl-12 pr-28 py-4 text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xl placeholder-gray-500 text-base"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block">
                      <button 
                        onClick={() => startNewChat(searchQuery)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        Ask AI <Send className="w-3 h-3 ml-2" />
                      </button>
                  </div>
              </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { icon: Book, title: 'Browse Docs', desc: 'Manuals & Guides', action: () => navigate(`/${Page.HELP_DOCS}`) },
                  { icon: Code, title: 'API Reference', desc: 'REST & Connectors', action: () => navigate(`/${Page.HELP_API}`) },
                  { icon: MessageCircle, title: 'Community', desc: 'Forum & Discord', action: () => navigate(`/${Page.HELP_COMMUNITY}`) },
              ].map((item, i) => (
                  <div key={i} onClick={item.action} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:bg-gray-700/50 cursor-pointer flex items-center gap-4 transition-colors">
                      <div className="p-3 bg-gray-700 rounded-lg text-blue-400">
                          <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-200">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 ml-auto" />
                  </div>
              ))}
          </div>
      </div>
    );
  }

  // --- Render Chat View ---
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Sidebar: Chat History */}
      <div className="w-72 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-700 bg-gray-750">
          <button 
            onClick={() => startNewChat()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">History</div>
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                activeSessionId === session.id 
                ? 'bg-gray-700 text-gray-100' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{session.title}</h3>
                      <p className="text-[10px] opacity-60 truncate">{session.preview}</p>
                  </div>
              </div>
              
              {/* Delete Button (Visible on Hover) */}
              <button 
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                  <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-750 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-100">AI Assistant</h2>
              <p className="text-xs text-gray-400 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  Model: Gemini Pro
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="text-xs text-gray-400 hover:text-white flex items-center px-3 py-1.5 bg-gray-700 rounded-lg transition-colors" onClick={() => setViewMode('home')}>
                 Exit Chat
             </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B1120]" ref={scrollRef}>
          {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                 <Bot className="w-16 h-16 mb-4" />
                 <p>Start a conversation with the AI Assistant.</p>
             </div>
          ) : (
             messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                }`}>
                  {/* Quick Markdown Simulation for Code Blocks */}
                  {msg.content.split('```').map((part, i) => {
                      if (i % 2 === 1) {
                          // Code block
                          return (
                              <div key={i} className="my-2 bg-[#1e1e1e] p-3 rounded-lg border border-gray-700 font-mono text-xs text-green-400 overflow-x-auto">
                                  {part}
                              </div>
                          );
                      }
                      // Normal text
                      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
                  })}
                  
                  <div className={`text-[10px] mt-1.5 text-right opacity-50 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.timestamp}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-purple-900/30">
                        <User className="w-5 h-5 text-white" />
                    </div>
                )}
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
              <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 shrink-0">
                      <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  </div>
              </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="relative">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..." 
              className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
              AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};
