import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'}/api`;

const LANGUAGES = [
  { code: 'en', label: 'English', speech: 'en-US' },
  { code: 'ta', label: 'தமிழ் (Tamil)', speech: 'ta-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', speech: 'hi-IN' },
  { code: 'es', label: 'Español', speech: 'es-ES' },
  { code: 'fr', label: 'Français', speech: 'fr-FR' },
  { code: 'de', label: 'Deutsch', speech: 'de-DE' },
];

const PLACEHOLDERS = {
  en: 'Ask anything about OncoSVM AI…',
  ta: 'OncoSVM AI பற்றி கேளுங்கள்…',
  hi: 'OncoSVM AI के बारे में पूछें…',
  es: 'Pregunta cualquier cosa sobre OncoSVM AI…',
  fr: 'Posez une question sur OncoSVM AI…',
  de: 'Fragen Sie etwas zu OncoSVM AI…',
};

const GREETINGS = {
  en: "Hi, I'm OncoBot — I can guide you through the app, explain biopsy features, or clarify how SVM works. Ask me anything!",
  ta: 'வணக்கம், நான் OncoBot. இந்த ஆப்பை எப்படிப் பயன்படுத்துவது, பயாப்ஸி அம்சங்கள் அல்லது SVM பற்றி நான் விளக்கமளிக்க முடியும்.',
  hi: 'नमस्ते! मैं OncoBot हूँ — मैं आपको ऐप का उपयोग करने, बायोप्सी विशेषताओं या SVM समझाने में मदद कर सकता हूँ।',
  es: 'Hola, soy OncoBot. Puedo guiarte por la app, explicar rasgos de biopsia o cómo funciona SVM.',
  fr: 'Bonjour, je suis OncoBot. Je peux vous guider dans l’app, expliquer les caractéristiques de biopsie ou SVM.',
  de: 'Hallo, ich bin OncoBot. Ich kann Sie durch die App führen, Biopsie-Merkmale oder SVM erklären.',
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sessionId] = useState(
    () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Seed greeting when opening for the first time in a language
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: GREETINGS[language] || GREETINGS.en }]);
    }
  }, [open, language, messages.length]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Web Speech Recognition setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = LANGUAGES.find((l) => l.code === language)?.speech || 'en-US';
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      // Auto-send after voice input
      setTimeout(() => sendMessage(transcript), 300);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANGUAGES.find((l) => l.code === language)?.speech || 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    try {
      recognitionRef.current.lang =
        LANGUAGES.find((l) => l.code === language)?.speech || 'en-US';
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  };

  const sendMessage = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/chat`,
        { session_id: sessionId, message: text, language },
        { withCredentials: true }
      );
      const reply = response.data.reply || response.data.response;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch (err) {
      const detail =
        err.response?.data?.detail || 'Failed to reach the assistant. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: detail, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="chat-widget-fab"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="OncoBot Assistant"
          aria-label="Open OncoBot assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          data-testid="chat-widget-panel"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0284C7] text-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  OncoBot
                </p>
                <p className="text-[10px] text-white/80 leading-tight">
                  Your AI assistant · Multilingual
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setVoiceEnabled((v) => !v)}
                data-testid="chat-voice-toggle"
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
                title={voiceEnabled ? 'Mute voice output' : 'Enable voice output'}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                data-testid="chat-close-button"
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language selector */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 flex-shrink-0">
            <label className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              data-testid="chat-language-select"
              className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F8FAFC]"
            data-testid="chat-messages-container"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`chat-msg-${m.role}-${i}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#0284C7] text-white rounded-br-none'
                      : m.error
                      ? 'bg-red-50 border border-red-200 text-[#B91C1C] rounded-bl-none'
                      : 'bg-white border border-slate-200 text-[#0F172A] rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start" data-testid="chat-loading">
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg rounded-bl-none flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
                  <span className="text-xs text-[#475569]">OncoBot is thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                data-testid="chat-mic-button"
                className={`p-2 rounded-md transition-colors ${
                  listening
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                }`}
                title={listening ? 'Stop listening' : 'Speak your question'}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.en}
                data-testid="chat-input"
                disabled={loading}
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0284C7] disabled:bg-slate-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                data-testid="chat-send-button"
                className="p-2 rounded-md bg-[#0284C7] hover:bg-[#0369A1] text-white disabled:opacity-40 transition-colors"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
