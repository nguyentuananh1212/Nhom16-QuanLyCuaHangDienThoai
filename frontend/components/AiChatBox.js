"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { vnd } from "@/lib/format";

const QUICK_SUGGESTIONS = [
  "📱 Tư vấn iPhone 16 Pro Max",
  "💰 Máy tốt giá dưới 10 triệu",
  "📸 Điện thoại chụp ảnh đẹp nhất",
  "🎮 Máy chơi game mượt pin trâu",
  "💳 Thanh toán bằng mã QR thế nào?",
  "🛡️ Chính sách bảo hành & đổi trả",
];

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: `Xin chào! Mình là **AURA AI** — Trợ lý tư vấn điện thoại thông minh của cửa hàng 🤖✨

Bạn có thể hỏi mình bất cứ điều gì:
• 📱 **Tư vấn chọn máy:** iPhone, Samsung Galaxy, Xiaomi, OPPO, Google Pixel...
• 💰 **Tìm theo tầm giá:** Dưới 5 triệu, 10 triệu, 15 triệu, flagship cao cấp...
• 📸 **Nhu cầu cụ thể:** Chụp ảnh đẹp, pin trâu chơi game, máy mỏng nhẹ...
• 💳 **Dịch vụ:** Hướng dẫn thanh toán mã QR ảo, bảo hành 12 tháng, đổi trả 1-1...

Hôm nay bạn cần hỗ trợ gì ạ?`,
    products: [],
  },
];

// Helper hiển thị định dạng văn bản markdown đơn giản (in đậm, danh sách gạch đầu dòng, liên kết)
function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed text-ink">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Xử lý in đậm **text**
        const parts = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-semibold text-ink">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Xử lý gạch đầu dòng
        if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-accent">•</span>
              <span>{parts}</span>
            </div>
          );
        }

        return <div key={idx}>{parts}</div>;
      })}
    </div>
  );
}

export default function AiChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadPrompt, setUnreadPrompt] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: "user", content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi phản hồi từ AI");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          products: data.products || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Rất tiếc, đường truyền AI tạm thời gián đoạn. Bạn vui lòng thử lại câu hỏi hoặc gọi hotline **1900 8899** để được hỗ trợ ngay nhé!",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Làm mới lại cuộc trò chuyện với AI?")) {
      setMessages(INITIAL_MESSAGES);
    }
  };

  return (
    <>
      {/* NÚT TRÒN NỔI MỞ CHATBOX Ở GÓC DƯỚI PHẢI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip gợi ý ban đầu khi chưa mở */}
        {!isOpen && unreadPrompt && (
          <div className="relative flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-2.5 shadow-lg animate-bounce">
            <span className="text-xs font-medium text-ink">Cần tư vấn máy? Chat với AI ngay!</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnreadPrompt(false);
              }}
              className="text-xs text-ink-3 hover:text-ink"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadPrompt(false);
          }}
          aria-label={isOpen ? "Đóng hộp chat AI" : "Mở trợ lý AI tư vấn"}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95"
        >
          {isOpen ? (
            <svg className="h-6 w-6 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              {/* Icon Robot / AI */}
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="10" rx="3" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth={3} strokeLinecap="round" />
                <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth={3} strokeLinecap="round" />
              </svg>
              {/* Chấm xanh trạng thái hoạt động */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-surface bg-emerald-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* CỬA SỔ CHAT BOX AI */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[580px] max-h-[82vh] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all max-sm:right-4 max-sm:bottom-20 max-sm:w-[calc(100vw-2rem)]">
          {/* HEADER CHAT BOX */}
          <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-sm">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                </svg>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-indigo-950 bg-emerald-400"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>AURA AI Assistant</span>
                  <span className="rounded bg-indigo-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-200">
                    Smart AI
                  </span>
                </div>
                <div className="text-[11px] text-indigo-200/80">Tư vấn chọn máy & hỗ trợ 24/7</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-indigo-200">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Làm mới cuộc trò chuyện"
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* KHUNG TIN NHẮN */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-paper/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Bubble tin nhắn */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                    m.role === "user"
                      ? "rounded-br-xs bg-accent text-accent-ink"
                      : "rounded-bl-xs border border-line bg-surface text-ink"
                  }`}
                >
                  {m.role === "user" ? (
                    <div className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <FormattedMessage text={m.content} />
                  )}
                </div>

                {/* Danh sách thẻ điện thoại được gợi ý */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2.5 flex w-full flex-col gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                      Sản phẩm liên quan đề xuất:
                    </span>
                    <div className="space-y-2">
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2.5 rounded-xl border border-line bg-surface p-2.5 shadow-xs hover:border-accent transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-bold text-xs text-ink">{p.name}</h4>
                            <div className="text-[11px] text-ink-3 truncate">
                              {p.chip} • {p.battery}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-price">
                              <span>{vnd(p.salePrice || p.price)}</span>
                              {p.salePrice && (
                                <span className="text-[10px] text-ink-3 line-through font-normal">
                                  {vnd(p.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/products/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="btn btn-sm btn-primary text-xs shrink-0"
                          >
                            Xem máy
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Hiệu ứng đang gõ tin nhắn */}
            {loading && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-line bg-surface px-3.5 py-2.5 shadow-xs w-fit">
                <span className="text-xs text-ink-3">AURA AI đang suy nghĩ</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* GỢI Ý CÂU HỎI NHANH */}
          <div className="border-t border-line bg-surface px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  className="shrink-0 whitespace-nowrap rounded-full border border-line bg-paper px-2.5 py-1 text-ink-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Ô NHẬP TIN NHẮN */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-line bg-surface p-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về điện thoại, giá bán, bảo hành..."
              disabled={loading}
              className="flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
