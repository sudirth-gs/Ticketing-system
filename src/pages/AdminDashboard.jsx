import React, { useState } from 'react';
import { Search, Filter, Shield, Clock, CheckCircle2, AlertCircle, ChevronRight, ListFilter } from 'lucide-react';

export default function AdminDashboard({ tickets, onSelectTicket }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Stats for the system
  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Support Console</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage, prioritize, and reply to all active ticket submissions.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-950/85 border border-slate-850 flex items-center justify-center">
            <Shield className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Queue Total</p>
            <h3 className="text-2xl font-bold text-white mt-1">{total}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Open</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">{openCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Queue & Filtering */}
      <div className="bg-slate-900/30 border border-slate-850 rounded-xl overflow-hidden shadow-xl">
        
        {/* Filters Panel */}
        <div className="p-5 border-b border-slate-850 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, customer name or subject..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Filtering Selects */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Queue Table */}
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-slate-300 font-semibold text-base">No tickets match current filters</h3>
            <p className="text-slate-500 text-sm mt-1">Try resetting the status/priority filters or changing search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => onSelectTicket(ticket.id)}
                    className="hover:bg-slate-900/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-100">{ticket.customerName}</td>
                    <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-950 text-slate-350 border border-slate-800 px-2 py-0.5 rounded text-xs">
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
