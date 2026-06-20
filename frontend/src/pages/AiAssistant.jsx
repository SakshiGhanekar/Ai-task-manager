import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, BrainCircuit, Copy, Check, TerminalSquare, Command, Zap, Code, LayoutList, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api'; 

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-medium"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy code'}
    </button>
  );
};

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : 'text'
          
          if (!inline) {
            return (
              <div className="my-6 rounded-xl overflow-hidden bg-[#0d1117] border border-slate-800 shadow-2xl relative group">
                <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <TerminalSquare size={15} className="text-slate-400" />
                    <span className="text-xs font-mono text-slate-300 capitalize">{language}</span>
                  </div>
                  <CopyButton code={String(children).replace(/\n$/, '')} />
                </div>
                <div className="p-5 overflow-x-auto text-[13px] font-mono leading-relaxed custom-scrollbar bg-transparent">
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{ background: 'transparent', padding: 0, margin: 0 }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            )
          }
          return (
            <code {...props} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-[0.85em] font-medium border border-slate-300 dark:border-slate-700">
              {children}
            </code>
          )
        },
        p({children}) {
          return <p className="mb-4 last:mb-0 text-[15px] leading-[1.75] text-slate-700 dark:text-slate-200">{children}</p>
        },
        ul({children}) {
          return <ul className="mb-4 last:mb-0 space-y-2 text-[15px] text-slate-700 dark:text-slate-200 list-disc list-outside ml-6">{children}</ul>
        },
        ol({children}) {
          return <ol className="mb-4 last:mb-0 space-y-2 text-[15px] text-slate-700 dark:text-slate-200 list-decimal list-outside ml-6">{children}</ol>
        },
        li({children}) {
          return <li className="pl-1 leading-[1.75]">{children}</li>
        },
        h1({children}) {
          return <h1 className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white flex items-center gap-2">{children}</h1>
        },
        h2({children}) {
          return <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white flex items-center gap-2">{children}</h2>
        },
        h3({children}) {
          return <h3 className="text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-white flex items-center gap-2">{children}</h3>
        },
        strong({children}) {
          return <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
        },
        a({children, href}) {
          return <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline font-medium decoration-blue-500/30 underline-offset-2">{children}</a>
        },
        blockquote({children}) {
          return <blockquote className="border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3 rounded-r-lg my-4 italic text-slate-700 dark:text-slate-300">{children}</blockquote>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const TypewriterMarkdown = ({ content, isTyping, onComplete, onContentChange }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const contentRef = useRef(content);
  contentRef.current = content;
  
  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      return;
    }
    
    setDisplayedContent('');
    let i = 0;
    
    const timer = setInterval(() => {
      setDisplayedContent((prev) => {
        const nextLen = prev.length + 3; // Type 3 chars at a time
        if (nextLen >= contentRef.current.length) {
          clearInterval(timer);
          onComplete && onComplete();
          return contentRef.current;
        }
        return contentRef.current.slice(0, nextLen);
      });
    }, 15);
    
    return () => clearInterval(timer);
  }, [content, isTyping, onComplete]);

  useEffect(() => {
    if (isTyping && onContentChange) {
      onContentChange();
    }
  }, [displayedContent, isTyping, onContentChange]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none w-full">
      <MarkdownRenderer content={displayedContent} />
      {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse align-middle"></span>}
    </div>
  );
};

const SUGGESTED_PROMPTS = [
  { icon: <LayoutList size={18} />, text: "Break down a complex project" },
  { icon: <Code size={18} />, text: "Write boilerplate code" },
  { icon: <Zap size={18} />, text: "Analyze productivity trends" }
];

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleSuggestionClick = (text) => {
    setInput(text + ' ');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleTypingComplete = (id) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTyping: false } : msg));
  };

  const handleSubmit = async (e, promptText = null) => {
    e?.preventDefault();
    const messageText = promptText || input;
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('ai/chat', { message: userMessage.content });
      
      const aiResponse = response.data.response;
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: aiResponse, isTyping: true }]);
    } catch (error) {
      console.warn("Backend not available, falling back to demo mode:", error.message);
      
      // Simulated AI responses for when the backend is not running
      const demoResponses = [
        "That's a great question! Since I'm currently running in **Demo Mode** without a backend server, I can't generate a real AI response right now. \n\nHowever, imagine a highly intelligent, perfectly structured breakdown of your task appearing right here! 🚀",
        "I can certainly help with that. \n\n*(Note: You are in Demo Mode because the backend server is disconnected. Please run the Spring Boot backend to enable real AI responses.)*",
        "Here is a suggested approach:\n\n1. **Define Scope**: Clearly outline your goals and deliverables.\n2. **Break it Down**: Divide the project into smaller, manageable tasks.\n3. **Execute**: Work through the tasks one by one.\n\n*(This is a simulated response as the backend server is currently offline)*",
        "I'd recommend using a modular architecture for this. It keeps the codebase clean and maintainable. \n\n```javascript\n// Demo Code Snippet\nfunction breakDownTask(task) {\n  return task.split(' ').map(step => `Execute: ${step}`);\n}\n```\n*(Simulated response)*"
      ];
      
      const aiResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'ai', 
          content: aiResponse,
          isTyping: true
        }]);
        setIsLoading(false);
      }, 1000);
      return;
    } 
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-brandCard border border-[var(--border-color)] shadow-2xl relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-accent-500/10 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-brandCard/80 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <BrainCircuit size={24} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-brandCard rounded-full"></span>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">Nexus AI</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              Powered by GPT-4 Turbo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button 
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              title="Clear Chat"
            >
              <Trash2 size={15} />
              <span className="text-xs font-medium hidden sm:block">New Chat</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-[var(--border-color)]">
            <Command size={14} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">K to focus</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 custom-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center max-w-2xl mx-auto text-center px-4 pt-12 md:pt-20 pb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 rounded-3xl flex items-center justify-center mb-6 relative"
            >
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
              <Sparkles size={40} className="text-cyan-500 relative z-10" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4"
            >
              How can I help you today?
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 mb-10 text-lg"
            >
              I'm your advanced AI Productivity Partner. Ask me anything to streamline your workflow.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
            >
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt.text)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-[var(--border-color)] bg-brandSidebar hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    {prompt.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{prompt.text}</span>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 md:gap-6 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/20 mt-1">
                    <Sparkles size={18} />
                  </div>
                )}
                
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                  {msg.role === 'ai' && (
                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                      Nexus AI
                    </span>
                  )}
                  <div className={`p-5 md:p-6 rounded-3xl ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-br-sm shadow-md' 
                      : 'bg-white/50 dark:bg-[#1e2330]/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-bl-sm shadow-xl shadow-slate-200/20 dark:shadow-none ring-1 ring-white/50 dark:ring-white/5 w-full overflow-hidden'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <TypewriterMarkdown 
                        content={msg.content} 
                        isTyping={msg.isTyping} 
                        onComplete={() => handleTypingComplete(msg.id)}
                        onContentChange={scrollToBottom}
                      />
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 mt-1">
                    <User size={18} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 md:gap-6 justify-start w-full">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 mt-1">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Nexus AI</span>
              <div className="p-5 rounded-3xl bg-white/50 dark:bg-[#1e2330]/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-bl-sm shadow-xl flex items-center gap-3 ring-1 ring-white/50 dark:ring-white/5">
                <div className="flex gap-1.5">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-cyan-500"></motion.div>
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-blue-500"></motion.div>
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-cyan-500"></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-brandCard/90 backdrop-blur-xl border-t border-[var(--border-color)] z-10 relative flex flex-col gap-3">
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-4xl mx-auto w-full mb-1">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(prompt.text)}
                className="px-3 py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-[var(--border-color)] flex items-center gap-1.5 whitespace-nowrap"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => handleSubmit(e)} className="relative flex items-center max-w-4xl mx-auto w-full">
          <div className="absolute left-4 text-slate-400 dark:text-slate-500">
            <Sparkles size={20} />
          </div>
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nexus AI to break down a task, write code, or analyze data..."
            className="w-full pl-12 pr-16 py-4 sm:py-5 rounded-2xl bg-brandSidebar border border-[var(--border-color)] focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none text-slate-900 dark:text-white font-medium text-[15px] shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:from-slate-400 disabled:to-slate-500 transition-all shadow-lg"
          >
            <Send size={18} className={isLoading ? "opacity-0" : "opacity-100"} />
            {isLoading && <Loader2 size={18} className="absolute inset-0 m-auto animate-spin" />}
          </button>
        </form>
        <p className="text-center text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium">
          Nexus AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;
