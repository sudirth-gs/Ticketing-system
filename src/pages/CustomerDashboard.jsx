import React from 'react';
import { PlusCircle, Clock, CheckCircle2, ChevronRight, Inbox } from 'lucide-react';

export default function CustomerDashboard({ currentUser, tickets, onSelectTicket, onNavigate }) {
  // Filter tickets for this customer
  const customerTickets = tickets.filter(t => t.customerId === currentUser.id);

  // Statistics
  const total = customerTickets.length;
  const openOrInProgress = customerTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolved = customerTickets.filter(t => t.status === 'Resolved').length;

  // Helpers for styling status and priority badges
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
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {currentUser.name}!</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track and manage your support tickets in real-time.</p>
        </div>
        <button
          onClick={() => onNavigate('create-ticket')}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-bold text-white mt-1">{total}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Tickets</p>
            <h3 className="text-2xl font-bold text-white mt-1">{openOrInProgress}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Resolved Tickets</p>
            <h3 className="text-2xl font-bold text-white mt-1">{resolved}</h3>
          </div>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="bg-slate-900/30 border border-slate-850 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-850 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white">Your Tickets</h2>
        </div>

        {customerTickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-slate-300 font-semibold text-base">No support tickets found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">If you need technical, billing or account support, create your first ticket below.</p>
            <button
              onClick={() => onNavigate('create-ticket')}
              className="mt-5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Submit a Ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {customerTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => onSelectTicket(ticket.id)}
                    className="hover:bg-slate-900/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-xs">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center border px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
