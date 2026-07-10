import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Shield, User, CheckCircle2 } from 'lucide-react';

export default function TicketDetailsPage({ currentUser, ticketId, tickets, replies, onStatusChange, onAddReply, onNavigate }) {
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  // Find active ticket
  const ticket = tickets.find(t => t.id === ticketId);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [replies]);

  if (!ticket) {
    return (
      <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
        <h3 className="text-white font-semibold">Ticket not found</h3>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Filter replies for this ticket
  const ticketReplies = replies.filter(r => r.ticketId === ticket.id);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(ticket.id, replyText.trim());
    setReplyText('');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/30';
      case 'In Progress':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      case 'Resolved':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-950/30 text-rose-400 border-rose-900/20';
      case 'Medium':
        return 'bg-orange-950/30 text-orange-400 border-orange-900/20';
      case 'Low':
        return 'bg-slate-950/40 text-slate-400 border-slate-800';
      default:
        return 'bg-slate-950 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Detail Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{ticket.title}</h1>
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 border border-slate-850 rounded">
              {ticket.id}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Submitted by {ticket.customerName}</p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Conversation Stream */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900/30 border border-slate-850 rounded-xl overflow-hidden shadow-xl h-[600px]">
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* Original Ticket Description (acts as initial message) */}
            <div className="flex items-start gap-3 bg-slate-950/30 border border-slate-850 rounded-xl p-4.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-200">{ticket.customerName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                <div className="pt-2">
                  <span className="text-[10px] bg-slate-950 text-indigo-400 border border-indigo-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Initial Description
                  </span>
                </div>
              </div>
            </div>

            {/* Replies List */}
            {ticketReplies.map((reply) => {
              const isAdmin = reply.senderRole === 'admin';
              return (
                <div 
                  key={reply.id} 
                  className={`flex items-start gap-3 p-4.5 rounded-xl border ${
                    isAdmin 
                      ? 'bg-slate-900/60 border-slate-800/80 ml-6 sm:ml-12' 
                      : 'bg-slate-950/35 border-slate-900/50 mr-6 sm:mr-12'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                    isAdmin 
                      ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' 
                      : 'bg-slate-900/85 border-slate-800 text-slate-400'
                  }`}>
                    {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{reply.senderName}</span>
                        {isAdmin && (
                          <span className="text-[9px] bg-emerald-950/80 border border-emerald-900/40 text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase">
                            Support Agent
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Composer */}
          {ticket.status === 'Resolved' ? (
            <div className="p-4 bg-emerald-950/20 border-t border-slate-850 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>This ticket is marked as Resolved. You can reply to reopen.</span>
            </div>
          ) : null}
          
          <form onSubmit={handleSubmitReply} className="p-4 bg-slate-950/40 border-t border-slate-850 flex items-center gap-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message reply..."
              rows="1"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitReply(e);
                }
              }}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sidebar Information / Metadata Pane */}
        <div className="space-y-5">
          
          {/* Metadata Card */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-850 pb-3">Ticket Details</h2>
            
            <div className="space-y-3.5">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Priority</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center border px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Category</p>
                <p className="text-sm font-medium text-slate-300 mt-0.5">{ticket.category}</p>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Submitted</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Control Actions (Admin Role Only) */}
          {currentUser.role === 'admin' && (
            <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-850 pb-3">Admin Actions</h2>
              
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Change Ticket Status
                </label>
                <select
                  id="admin-status-select"
                  value={ticket.status}
                  onChange={(e) => {
                    console.log('Status changed to:', e.target.value);
                    onStatusChange(ticket.id, e.target.value);
                  }}
                  style={{ appearance: 'auto', WebkitAppearance: 'auto', MozAppearance: 'auto' }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer relative z-10"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
