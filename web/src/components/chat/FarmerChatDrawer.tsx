import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  ShoppingBag,
  TrendingUp,
  CloudSun,
  Tractor,
  Users,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AIApi, ChatMessageItem, UICard } from '../../api/ai.api.js';

export const FarmerChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'te' | 'hi' | 'en'>('te');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome greeting
    if (messages.length === 0) {
      const greeting =
        language === 'te'
          ? 'నమస్కారం! నేను మీ కిసాన్ మిత్ర AI సహాయకుడిని. పంట తెగుళ్లు, ఎరువుల మోతాదు, మార్కెట్ ధరలు, లేదా ట్రాక్టర్ బుకింగ్ గురించి ఏదైనా అడగండి.'
          : language === 'hi'
          ? 'नमस्ते! मैं आपका किसान मित्र AI सहायक हूँ। फसल रोग, खाद, मंडी भाव या ट्रैक्टर बुकिंग के बारे में पूछें।'
          : 'Namaste! I am your Kissan Mithar AI assistant. Ask me about crop diseases, fertilizer dosage, mandi prices, or tractor booking.';

      setMessages([
        {
          id: 'welcome',
          sender: 'ASSISTANT',
          text: greeting,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [language, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: 'msg_' + Date.now(),
      sender: 'USER',
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await AIApi.sendMessage({
        message: textToSend,
        sessionId,
        languageCode: language,
      });

      if (response) {
        if (!sessionId) setSessionId(response.sessionId);

        const assistantMessage: ChatMessageItem = {
          id: response.messageId,
          sender: 'ASSISTANT',
          text: response.reply,
          uiCards: response.uiCards,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ASSISTANT',
          text:
            language === 'te'
              ? 'క్షమించండి, సర్వర్ స్పందించలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
              : 'Sorry, could not process request right now. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const handleCardAction = (card: UICard, actionType: string) => {
    if (actionType === 'CART_ADD') {
      setCartItemsCount((prev) => prev + 1);
      alert(`✅ Added ${card.data.name} to cart!`);
    } else if (actionType === 'QUICK_BUY') {
      alert(`📦 Order initiated for ${card.data.name}! We will deliver to your village.`);
    }
  };

  const shortcuts = [
    { label: language === 'te' ? 'ఆకులు పసుపు రంగు' : 'Leaf Yellowing', icon: Sparkles, query: 'Na paddy crop ki leaves yellow ga avutunnayi' },
    { label: language === 'te' ? 'మండి ధరలు' : 'Mandi Prices', icon: TrendingUp, query: 'Ee roju paddy mandi price entha?' },
    { label: language === 'te' ? 'ట్రాక్టర్ రెంట్' : 'Tractor Rent', icon: Tractor, query: 'Repu tractor available unda?' },
    { label: language === 'te' ? 'కూలీల బుకింగ్' : 'Labour Booking', icon: Users, query: 'Maa village lo harvesting labour kavali' },
  ];

  return (
    <>
      {/* Floating Action Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-200"></span>
        </span>
        <MessageCircle className="w-6 h-6" />
        <span className="font-bold text-sm tracking-wide">
          {language === 'te' ? 'కిసాన్ AI అసిస్టెంట్' : 'Kissan AI Assistant'}
        </span>
        {cartItemsCount > 0 && (
          <span className="bg-amber-400 text-emerald-950 font-black text-xs px-2 py-0.5 rounded-full">
            {cartItemsCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Kissan Mithar AI</h3>
                  <p className="text-xs text-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
                    Online Agronomy Specialist
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-emerald-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-600 focus:outline-none"
                >
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                </select>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:bg-emerald-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="bg-emerald-50/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-emerald-100 text-xs scrollbar-none">
              {shortcuts.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.query)}
                    className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-100/60 transition-colors shadow-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Message Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'USER'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Render Attached Interactive UI Cards */}
                  {msg.uiCards && msg.uiCards.length > 0 && (
                    <div className="w-full mt-3 space-y-2.5">
                      {msg.uiCards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm overflow-hidden"
                        >
                          {/* PRODUCT CARD */}
                          {card.type === 'PRODUCT_CARD' && (
                            <div className="flex gap-3">
                              {card.data.imageUrl && (
                                <img
                                  src={card.data.imageUrl}
                                  alt={card.data.name}
                                  className="w-20 h-20 object-cover rounded-lg bg-slate-100 shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                  {card.data.brand}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900 truncate">
                                  {card.data.name}
                                </h4>
                                <p className="text-xs text-slate-500 truncate">
                                  {card.data.technicalName} ({card.data.packagingSize})
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    ₹{card.data.price}
                                  </span>
                                  {card.data.mrp && card.data.mrp > card.data.price && (
                                    <span className="text-xs text-slate-400 line-through">
                                      ₹{card.data.mrp}
                                    </span>
                                  )}
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    In Stock
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-2.5">
                                  <button
                                    onClick={() => handleCardAction(card, 'CART_ADD')}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={() => handleCardAction(card, 'QUICK_BUY')}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                                  >
                                    Buy Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* MANDI PRICE CARD */}
                          {card.type === 'MANDI_CARD' && (
                            <div>
                              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-800">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                {card.title}
                              </div>
                              <div className="space-y-1.5">
                                {card.data.markets?.map((m: any, mIdx: number) => (
                                  <div
                                    key={mIdx}
                                    className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs"
                                  >
                                    <div>
                                      <p className="font-semibold text-slate-900">{m.market}</p>
                                      <p className="text-[11px] text-slate-500">
                                        Modal: ₹{m.modalPrice}/Q
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`font-black text-[11px] px-1.5 py-0.5 rounded ${
                                          m.trend === 'UP'
                                            ? 'text-emerald-700 bg-emerald-100'
                                            : 'text-amber-700 bg-amber-100'
                                        }`}
                                      >
                                        {m.trend}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* BOOKING CARD */}
                          {card.type === 'BOOKING_CARD' && (
                            <div>
                              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-800">
                                <Tractor className="w-4 h-4 text-emerald-600" />
                                {card.title}
                              </div>
                              <div className="bg-emerald-50/70 p-2.5 rounded-lg text-xs space-y-1">
                                <p className="text-slate-700">
                                  <span className="font-semibold">Operator Area:</span>{' '}
                                  {card.data.operatorLocation || card.data.location}
                                </p>
                                <p className="text-slate-700">
                                  <span className="font-semibold">Rate:</span> ₹
                                  {card.data.hourlyRate || card.data.suggestedDailyWage}{' '}
                                  {card.data.rateUnit || 'per day'}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  alert(
                                    `Booking registered for ${card.data.machineryType || card.data.taskType}! Our coordinator will call you.`
                                  )
                                }
                                className="w-full mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Confirm Booking Request
                              </button>
                            </div>
                          )}

                          {/* WEATHER CARD */}
                          {card.type === 'WEATHER_CARD' && (
                            <div>
                              <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-slate-800">
                                <CloudSun className="w-4 h-4 text-amber-500" />
                                {card.title}
                              </div>
                              <div className="bg-amber-50/80 p-2.5 rounded-lg text-xs text-amber-900 font-medium">
                                {card.data.sprayAdvisory}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl w-fit shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>
                    {language === 'te'
                      ? 'AI విశ్లేషిస్తోంది...'
                      : 'AI is analyzing your request...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Speak in Telugu/Hindi/English"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'మీ ప్రశ్న ఇక్కడ టైప్ చేయండి...'
                      : language === 'hi'
                      ? 'अपना सवाल यहाँ लिखें...'
                      : 'Ask about crops, fertilizers, mandi...'
                  }
                  className="flex-1 bg-slate-100 text-slate-900 text-sm px-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
