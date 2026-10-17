'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, X, Send, Bot, User, Trash2, Copy, 
  Check, ArrowRight, CornerDownLeft, RefreshCw, 
  MessageSquare, Lightbulb, FileText, BookOpen, Layers,
  Mic, MicOff, Volume2, VolumeX, Radio, Square, AudioWaveform
} from 'lucide-react';

function renderBold(text: string) {
  const boldParts = text.split(/\*\*(.*?)\*\*/g);
  return boldParts.map((chunk, i) => (i % 2 === 1 ? <strong key={i} className="font-bold">{chunk}</strong> : chunk));
}

function FormattedContent({ content }: { content: string }) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const paragraphs = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words">
      {paragraphs.map((line, pIdx) => {
        if (!line.trim()) return <div key={pIdx} className="h-1" />;

        const parts: React.ReactNode[] = [];
        let lastIdx = 0;
        let match;

        while ((match = linkRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            parts.push(renderBold(line.slice(lastIdx, match.index)));
          }
          const label = match[1];
          const href = match[2];
          parts.push(
            <Link
              key={match.index}
              href={href}
              className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-800 transition-colors mx-0.5 inline-flex items-center gap-0.5"
            >
              {label}
            </Link>
          );
          lastIdx = match.index + match[0].length;
        }

        if (lastIdx < line.length) {
          parts.push(renderBold(line.slice(lastIdx)));
        }

        return <p key={pIdx}>{parts}</p>;
      })}
    </div>
  );
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    icon: FileText,
    label: 'Generate Questions',
    prompt: 'Generate 5 multiple choice questions on Time and Work with 4 options, the correct answer, and detailed solutions.'
  },
  {
    icon: MessageSquare,
    label: 'Draft Test Reminder',
    prompt: 'Draft an encouraging WhatsApp announcement for 3rd Year CSE students regarding tomorrow morning\'s Mock Test.'
  },
  {
    icon: Lightbulb,
    label: 'Concept Analogy',
    prompt: 'Explain Time Complexity and Big-O notation using a simple real-life everyday analogy for undergraduate students.'
  },
  {
    icon: BookOpen,
    label: 'Remedial Strategy',
    prompt: 'My class has an average score of only 42% in Verbal Reading Comprehension. Suggest a 1-week action plan to improve their scores.'
  }
];

// Helper to clean markdown for speech synthesis
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1')     // remove italics
    .replace(/#{1,6}\s+/g, '')       // remove headers
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // remove code ticks
    .replace(/[•\-\*]\s+/g, '')      // remove bullets
    .replace(/\n+/g, '. ')           // replace newlines with periods
    .trim();
}

export default function TeacherAICopilotPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testwise_teacher_copilot_chat');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello Professor! 👋 I am your **TestWise 2-Way Voice & Text AI Copilot**.\n\nYou can **type** your question or **click the microphone 🎙️** to speak to me directly! I will answer your questions and speak back to you in real-time.\n\n• **Generate exam questions** on any topic\n• **Draft student notices & WhatsApp alerts**\n• **Analyze student weaknesses & suggest remedial plans**\n\nHow can I assist your teaching today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 2-Way Voice States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceReplyEnabled, setIsVoiceReplyEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputPrompt(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech Function
  const speakText = (text: string, msgId?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')) && !v.name.includes('Bad'));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Toggle Voice Input (Microphone)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setTimeout(() => textareaRef.current?.focus(), 150);
  }, [messages]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('testwise_teacher_copilot_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt.trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/teacher-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      const replyText = data.reply || data.error || 'Sorry, I encountered an issue. Please try again.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...newMessages, assistantMessage]);

      if (isVoiceReplyEnabled) {
        speakText(replyText, assistantMessage.id);
      }
    } catch (err: any) {
      console.error('Copilot Send Error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble connecting to the AI service. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Clear your conversation with AI Copilot?')) {
      stopSpeaking();
      const resetMessages: ChatMessage[] = [
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Chat cleared! How can I assist you with your classes or assessments today? Feel free to speak or type.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMessages);
      localStorage.setItem('testwise_teacher_copilot_chat', JSON.stringify(resetMessages));
    }
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '420px', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 shadow-2xl relative z-40 overflow-hidden font-sans"
    >
      {/* 1. Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-yellow-300 shadow-inner">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                TestWise AI Copilot
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 mt-0.5 line-clamp-1">
              2-Way Voice & Text Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mute/Voice Output Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsVoiceReplyEnabled(!isVoiceReplyEnabled);
            }}
            title={isVoiceReplyEnabled ? 'Voice reply is ON (Click to mute)' : 'Voice reply is MUTED (Click to unmute)'}
            className={`p-2 rounded-xl transition-colors ${
              isVoiceReplyEnabled 
                ? 'text-emerald-300 bg-white/10 hover:bg-white/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isVoiceReplyEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            title="Clear Conversation"
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
          </button>

          {/* Close Panel Button */}
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            title="Close Panel and Expand Dashboard"
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Speaking Banner */}
      {isSpeaking && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between text-xs animate-in fade-in duration-300 shadow-inner shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-semibold text-xs">AI speaking answer aloud...</span>
          </div>
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-md font-bold text-[11px] transition-colors"
          >
            <Square size={11} fill="white" /> Stop Audio
          </button>
        </div>
      )}

      {/* 2. Messages List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-900/50 text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isThisSpeaking = speakingMessageId === msg.id && isSpeaking;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm relative group ${
                isUser 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
              }`}>
                {/* Content */}
                <FormattedContent content={msg.content} />

                {/* Footer: Time, Listen, Copy */}
                <div className={`flex items-center justify-between gap-3 mt-2 pt-1.5 text-[10px] border-t ${
                  isUser 
                    ? 'border-white/10 text-indigo-200' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-2.5">
                    {!isUser && (
                      <button
                        onClick={() => {
                          if (isThisSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(msg.content, msg.id);
                          }
                        }}
                        title={isThisSpeaking ? 'Stop speaking' : 'Read aloud with AI voice'}
                        className={`flex items-center gap-1 font-semibold transition-colors ${
                          isThisSpeaking ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                        }`}
                      >
                        {isThisSpeaking ? (
                          <>
                            <Square size={10} fill="currentColor" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={11} />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User size={15} />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={15} />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Generating response</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions (if chat is short) */}
      {messages.length <= 2 && (
        <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Suggested Prompts:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {STARTER_PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all"
                >
                  <Icon size={13} className="text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Voice Listening Animation Banner */}
      {isListening && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-xs animate-pulse shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <Mic size={15} className="animate-bounce" />
            <span className="font-bold">Listening to you... Speak now!</span>
          </div>
          <button
            onClick={toggleListening}
            className="bg-white text-red-600 font-extrabold px-2 py-0.5 rounded text-[11px] hover:bg-red-50 shadow-sm"
          >
            Done
          </button>
        </div>
      )}

      {/* 3. Input Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="space-y-1.5"
        >
          <div className={`relative rounded-xl border transition-all ${
            isListening 
              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' 
              : 'border-slate-300 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-slate-50 dark:bg-slate-900'
          }`}>
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening to your voice... (speak now)" : "Type or speak your question..."}
              className="w-full bg-transparent px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-slate-200/50 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop recording voice' : 'Click to speak your question'}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isListening 
                      ? 'bg-red-600 text-white shadow-md animate-pulse' 
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200'
                  }`}
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-sm transition-all"
              >
                <span>Send</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>

    </motion.div>
  );
}

