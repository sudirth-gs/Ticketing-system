import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function CreateTicketPage({ onSubmit, onNavigate }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill out all required fields');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Support Ticket</h1>
          <p className="text-slate-400 text-sm mt-0.5">Describe your issue in detail and we'll reply as soon as possible.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-6 shadow-xl space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">
              Ticket Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Can't access bill portal / API returning 500 error"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm cursor-pointer"
              >
                <option value="Technical">Technical Support</option>
                <option value="Billing">Billing & Invoices</option>
                <option value="Account">Account Access</option>
                <option value="General">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              placeholder="Please provide steps to reproduce, error codes, and details..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
