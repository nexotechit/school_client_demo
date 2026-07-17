'use client';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { API_URL } from '../../../../config/api';

export default function MessagesPage() {
  const [user, setUser]               = useState(null);
  const [teachers, setTeachers]       = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState('');
  const [sending, setSending]         = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [tab, setTab]                 = useState('conversations'); // 'conversations' | 'new'
  const pollingRef    = useRef(null);
  const messagesEndRef = useRef(null);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/teachers`);
      const data = await res.json();
      if (data.success !== false) setTeachers(data.data || data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations/${user._id}`);
      const data = await res.json();
      if (data.success) setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.warn('[messages] fetchMessages called without conversationId');
      return;
    }

    if (!API_URL) {
      console.warn('[messages] API_URL not configured');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const res = await fetch(`${API_URL}/api/messages/${conversationId}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn('[messages] fetchMessages non-OK status', res.status);
        setMessages([]);
        return;
      }

      const data = await res.json().catch(() => null);
      if (!data || data.success === false) {
        console.warn('[messages] fetchMessages invalid JSON/response', data);
        setMessages([]);
        return;
      }

      setMessages(data.data || []);

      // mark as read (best-effort)
      if (user?._id) {
        fetch(`${API_URL}/api/messages/${conversationId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id })
        }).catch(e => console.warn('[messages] markAsRead failed', e));
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[messages] fetchMessages aborted (timeout) for', conversationId);
      } else {
        console.warn('[messages] fetchMessages network/error:', err);
      }
      // show empty state rather than throwing
      setMessages([]);
    } finally {
      clearTimeout(timeout);
    }
  }, [user?._id]);

  const filteredTeachers = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return (teachers || [])
      .slice()
      .sort((a, b) => (a?.name || a?.email || '').localeCompare(b?.name || b?.email || '', undefined, { sensitivity: 'base' }))
      .filter(t => {
        if (!q) return true;
        const hay = `${t?.name || ''} ${t?.email || ''} ${t?.subject || ''}`.toLowerCase();
        return hay.includes(q);
      });
  }, [teachers, query]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, filteredTeachers.length]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredTeachers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const t = filteredTeachers[highlightedIndex >= 0 ? highlightedIndex : 0];
      if (t) {
        openChatWith(t);
        setQuery('');
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setQuery('');
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTeachers();
    fetchConversations();
  }, [user, fetchTeachers, fetchConversations]);

  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    fetchMessages(activeConv.conversationId).finally(() => setLoadingMsgs(false));
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(activeConv.conversationId).catch(e => console.warn('[messages] poll fetchMessages uncaught:', e));
        fetchConversations().catch(e => console.warn('[messages] poll fetchConversations uncaught:', e));
      }
    }, 3000);
    return () => clearInterval(pollingRef.current);
  }, [activeConv, fetchMessages, fetchConversations]);

  useEffect(() => {
    // scroll to bottom on messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChatWith = async (teacher) => {
    // find existing conversation
    const conv = conversations.find(c => c.other?.userId === teacher._id);
    if (conv) {
      setActiveConv(conv);
      return;
    }

    // create empty conversation by sending an initial system message (or wait until student sends first message)
    setActiveConv({ conversationId: [user._id, teacher._id].sort().join('_'), other: { userId: teacher._id, name: teacher.name, role: 'teacher' } });
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return;

    const messageText = text.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage = { _id: tempId, senderId: user._id, text: messageText, createdAt: new Date().toISOString(), read: false };

    // Optimistic UI update
    setMessages(prev => [...prev, tempMessage]);
    setText('');
    setSending(true);

    const payload = {
      fromId: user._id,
      fromRole: 'student',
      toId: activeConv.other.userId,
      toRole: 'teacher',
      text: messageText
    };

    console.log('[messages] sending (student):', payload);

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // always attempt to parse JSON response from server
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        // rollback optimistic message and show server message when available
        setMessages(prev => prev.filter(m => m._id !== tempId));
        const msg = data?.message || `Server error ${res.status}`;
        console.warn('[messages] server error:', res.status, data);
        if (msg === 'Route not found') {
          window.alert('Messaging service unavailable. If you are testing locally, start the backend (server). If you are on the live site, redeploy the API.');
        } else {
          window.alert(msg);
        }
      } else {
        const conv = data?.data;
        const convId = conv?.conversationId || activeConv?.conversationId || [user._id, activeConv?.other?.userId].sort().join('_');
        setActiveConv({ conversationId: convId, other: { userId: activeConv.other.userId, name: activeConv.other.name, role: 'teacher' } });
        // refresh from server (replaces optimistic message with canonical data)
        await fetchMessages(convId);
        await fetchConversations();
      }
    } catch (err) {
      console.error('[messages] initial send failed, will retry once:', err);

      // Do NOT remove optimistic message yet — attempt single retry
      try {
        const retryRes = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const retryData = await retryRes.json().catch(() => null);

        if (!retryRes.ok || retryData?.success === false) {
          // rollback optimistic message after retry failed
          setMessages(prev => prev.filter(m => m._id !== tempId));
          const msg = retryData?.message || `Server error ${retryRes.status}`;
          console.warn('[messages] retry failed:', retryRes.status, retryData);
          if (msg === 'Route not found') {
            window.alert('Messaging service unavailable. If you are testing locally, start the backend (server). If you are on the live site, redeploy the API.');
          } else {
            window.alert(msg);
          }
        } else {
          // retry succeeded — sync state
          const conv = retryData.data;
          setActiveConv({ conversationId: conv.conversationId, other: { userId: activeConv.other.userId, name: activeConv.other.name, role: 'teacher' } });
          await fetchMessages(conv.conversationId);
          await fetchConversations();
        }
      } catch (retryErr) {
        console.error('[messages] retry attempt failed:', retryErr);
        // rollback optimistic message after retry failure
        setMessages(prev => prev.filter(m => m._id !== tempId));

        // ping server to determine reachability
        try {
          const ping = await fetch(`${API_URL}/`, { cache: 'no-store' });
          if (!ping.ok) {
            window.alert(`Messaging server reachable but returned ${ping.status}. If you are testing locally start the backend; if on production redeploy the API.`);
          } else {
            window.alert(`Failed to send message — server returned an unexpected error. Check console for details: ${retryErr.message || retryErr}`);
          }
        } catch (pingErr) {
          console.warn('[messages] ping failed:', pingErr);
          window.alert('Unable to reach messaging server. Please start the backend or check your network connection.');
        }
      }
    } finally {
      setSending(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
      Please login to use messaging.
    </div>
  );

  const fmt     = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const initial = (name) => (name || '?').charAt(0).toUpperCase();

  /* ── sidebar JSX ──────────────────────────────────────────── */
  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('conversations')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'conversations' ? 'text-blue-900 border-b-2 border-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Chats
          {conversations.filter(c => c.unreadCount > 0).length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {conversations.filter(c => c.unreadCount > 0).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('new')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'new' ? 'text-blue-900 border-b-2 border-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'conversations' ? (
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">No conversations yet</span>
              <button onClick={() => setTab('new')} className="mt-2 text-xs text-blue-900 underline">Message a teacher</button>
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
                        <span className="font-medium text-sm text-gray-800 truncate">{c.other?.name || 'Teacher'}</span>
                        {c.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{c.unreadCount}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage?.text || 'No messages yet'}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="p-3">
            <div className="relative mb-3">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by name or subject…"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                aria-label="Search teachers"
              />
            </div>
            {filteredTeachers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{teachers.length === 0 ? 'Loading teachers…' : 'No teachers match'}</p>
            ) : (
              <ul role="listbox" aria-label="Teacher suggestions">
                {filteredTeachers.map((t, idx) => (
                  <li
                    key={t._id}
                    role="option"
                    aria-selected={activeConv?.other?.userId === t._id}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                    onClick={() => { openChatWith(t); setQuery(''); setTab('conversations'); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                      ${activeConv?.other?.userId === t._id ? 'bg-blue-50' : highlightedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm shrink-0">
                      {initial(t.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{t.name}</div>
                      <div className="text-xs text-gray-400 truncate">{t.subject || t.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet — say hello!</div>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-colors"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            placeholder="Write a message… (Enter to send)"
            aria-label="Write a message"
          />
          <button
            onClick={sendMessage}
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
      <p className="text-sm font-medium">No conversation selected</p>
      <p className="text-xs mt-1 opacity-60">Choose a chat or message a new teacher</p>
    </div>
  );

  return (
    <div className="p-3 md:p-6">
      <div className="container mx-auto h-[calc(100svh-8rem)] md:h-[calc(100svh-7rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        {/* Sidebar */}
        <div className={`flex-col shrink-0 border-r border-gray-100 w-full md:w-72 lg:w-80
          ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          {sidebar}
        </div>
        {/* Chat */}
        <div className={`flex-col flex-1 min-w-0
          ${activeConv ? 'flex' : 'hidden md:flex'}`}>
          {chat}
        </div>
      </div>
    </div>
  );
}
