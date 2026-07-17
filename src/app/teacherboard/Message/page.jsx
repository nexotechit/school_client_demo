'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API_URL } from '../../../../config/api';

export default function TeacherMessagesPage() {
  const [user, setUser]               = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending]         = useState(false);
  const pollingRef = useRef(null);
  const endRef     = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res  = await fetch(`${API_URL}/api/messages/conversations/${user._id}`);
      const data = await res.json();
      if (data.success) setConversations(data.data || []);
    } catch (err) { console.error(err); }
  }, [user]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId || !user?._id) return;
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${API_URL}/api/messages/${conversationId}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) { setMessages([]); return; }
      const data = await res.json().catch(() => null);
      if (!data || data.success === false) { setMessages([]); return; }
      setMessages(data.data || []);
      fetch(`${API_URL}/api/messages/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      }).catch(console.warn);
      fetchConversations();
    } catch (err) {
      if (err.name !== 'AbortError') console.warn(err);
      setMessages([]);
    } finally { clearTimeout(timeout); }
  }, [user, fetchConversations]);

  useEffect(() => { if (user) fetchConversations(); }, [user, fetchConversations]);

  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    fetchMessages(activeConv.conversationId).finally(() => setLoadingMsgs(false));
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      if (document.visibilityState === 'visible')
        fetchMessages(activeConv.conversationId).catch(console.warn);
    }, 3000);
    return () => clearInterval(pollingRef.current);
  }, [activeConv, fetchMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendReply = async () => {
    if (!text.trim() || !activeConv || sending) return;
    const messageText = text.trim();
    const tempId      = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { _id: tempId, senderId: user._id, text: messageText, createdAt: new Date().toISOString() }]);
    setText('');
    setSending(true);
    const payload = { fromId: user._id, fromRole: 'teacher', toId: activeConv.other.userId, toRole: 'student', text: messageText };
    try {
      const res  = await fetch(`${API_URL}/api/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        setMessages(prev => prev.filter(m => m._id !== tempId));
        const msg = data?.message || `Error ${res.status}`;
        alert(msg === 'Route not found' ? 'Messaging service unavailable.' : msg);
      } else {
        await fetchMessages(data?.data?.conversationId || activeConv.conversationId);
        fetchConversations();
      }
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      alert('Failed to send. Check your connection.');
    } finally { setSending(false); }
  };

  const fmt     = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const initial = (name) => (name || '?').charAt(0).toUpperCase();

  if (!user) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
      Please login as a teacher to view messages.
    </div>
  );

  /* ── shared sidebar JSX ───────────────────────────────────── */
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-base">Messages</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">No conversations yet</span>
          </div>
        ) : (
          <ul>
            {conversations.map(c => (
              <li key={c.conversationId}>
                <button
                  onClick={() => setActiveConv(c)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-50 hover:bg-gray-50
                    ${activeConv?.conversationId === c.conversationId ? 'bg-blue-50 border-l-[3px] border-l-blue-800' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                    {initial(c.other?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-gray-800 truncate">{c.other?.name || 'Student'}</span>
                      {c.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage?.text || 'No messages'}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  /* ── chat panel JSX ───────────────────────────────────────── */
  const chat = activeConv ? (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
        <button
          onClick={() => setActiveConv(null)}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Back to conversations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {initial(activeConv.other?.name)}
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-800">{activeConv.other?.name}</div>
          <div className="text-xs text-gray-400 capitalize">{activeConv.other?.role}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet.</div>
        ) : messages.map(m => {
          const mine = String(m.senderId) === String(user._id);
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col gap-0.5 max-w-[80%] sm:max-w-[65%] ${mine ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed wrap-break-word
                  ${mine ? 'bg-blue-900 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{fmt(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
            rows={1}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-colors"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            placeholder="Write a reply… (Enter to send)"
            aria-label="Write a reply"
          />
          <button
            onClick={sendReply}
            disabled={sending || !text.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label={sending ? 'Sending' : 'Send'}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
      <svg className="w-14 h-14 mb-3 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p className="text-sm font-medium">Select a conversation</p>
      <p className="text-xs mt-1 opacity-60">Choose a student to start messaging</p>
    </div>
  );

  return (
    <div className="p-3 md:p-6">
      <div className="container mx-auto h-[calc(100svh-8rem)] md:h-[calc(100svh-7rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">

        {/* Sidebar — full width on mobile when no conv selected */}
        <div className={`flex-col shrink-0 border-r border-gray-100 w-full md:w-72 lg:w-80
          ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          {sidebar}
        </div>

        {/* Chat — full width on mobile when conv is active */}
        <div className={`flex-col flex-1 min-w-0
          ${activeConv ? 'flex' : 'hidden md:flex'}`}>
          {chat}
        </div>
      </div>
    </div>
  );
}
