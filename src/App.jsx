import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import { LogOut, Ticket, LayoutDashboard, PlusCircle } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('support_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tickets, setTickets] = useState([]);
  const [replies, setReplies] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Load tickets on mount or when currentUser changes
  const fetchTickets = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch('/tickets', {
        headers: { 'X-User-Id': userId }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTickets(currentUser.id);
    }
  }, [currentUser, fetchTickets]);

  // Load specific ticket details and replies
  const fetchTicketDetails = useCallback(async (ticketId) => {
    if (!currentUser || !ticketId) return;
    try {
      const response = await fetch(`/tickets/${ticketId}`, {
        headers: { 'X-User-Id': currentUser.id }
      });
      if (response.ok) {
        const { ticket, replies: ticketReplies } = await response.json();
        setTickets(prev => {
          const exists = prev.some(t => t.id === ticketId);
          if (exists) {
            return prev.map(t => t.id === ticketId ? ticket : t);
          } else {
            return [ticket, ...prev];
          }
        });
        setReplies(ticketReplies);
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentPage === 'ticket-details' && selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [currentPage, selectedTicketId, fetchTicketDetails]);

  // Authentication handlers
  const handleLogin = (user) => {
    localStorage.setItem('support_user', JSON.stringify(user));
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('support_user');
    setCurrentUser(null);
    setSelectedTicketId(null);
    setCurrentPage('dashboard');
  };



  // Ticket submissions
  const handleCreateTicket = async ({ title, category, priority, description }) => {
    try {
      const response = await fetch('/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({ title, description, category, priority })
      });
      if (response.ok) {
        const newTicket = await response.json();
        setTickets(prev => [newTicket, ...prev]);
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
    }
  };

  // Status changes (Admin action)
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        const updatedTicket = data.ticket;
        // Use functional form to avoid stale closure bug
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        // If we're currently viewing this ticket, refresh its details to keep replies/status in sync
        if (selectedTicketId === ticketId) {
          await fetchTicketDetails(ticketId);
        }
      } else {
        const errData = await response.json();
        console.error("Status update rejected:", errData.error);
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  // Reply submissions
  const handleAddReply = async (ticketId, messageText) => {
    try {
      const response = await fetch(`/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({ message: messageText })
      });
      if (response.ok) {
        const newReply = await response.json();
        setReplies(prev => [...prev, newReply]);
        // Re-fetch details to sync status (e.g. reopened resolved ticket)
        fetchTicketDetails(ticketId);
      }
    } catch (err) {
      console.error("Error submitting reply:", err);
    }
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentPage('ticket-details');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // If not logged in, show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-850 sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow shadow-indigo-600/30">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight hidden sm:inline-block">SupportPortal</span>
        </div>

        {/* Action Controls & Profile Menu */}
        <div className="flex items-center gap-3.5">
          


          {/* User details */}
          <div className="flex items-center gap-3 pl-2.5 border-l border-slate-800">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-sm font-semibold text-slate-200">{currentUser.name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {currentUser.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900/50 md:border-r border-slate-850 p-4 md:p-5 flex flex-col gap-6 shrink-0">
          
          <div className="space-y-1.5">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-2.5">Menu</p>
            
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                currentPage === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => handleNavigate('create-ticket')}
                className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                  currentPage === 'create-ticket' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Ticket</span>
              </button>
            )}
          </div>



        </aside>

        {/* Active Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            isAdmin ? (
              <AdminDashboard 
                tickets={tickets} 
                onSelectTicket={handleSelectTicket} 
              />
            ) : (
              <CustomerDashboard 
                currentUser={currentUser} 
                tickets={tickets} 
                onSelectTicket={handleSelectTicket} 
                onNavigate={handleNavigate} 
              />
            )
          )}

          {currentPage === 'create-ticket' && !isAdmin && (
            <CreateTicketPage 
              onSubmit={handleCreateTicket} 
              onNavigate={handleNavigate} 
            />
          )}

          {currentPage === 'ticket-details' && (
            <TicketDetailsPage 
              currentUser={currentUser} 
              ticketId={selectedTicketId} 
              tickets={tickets} 
              replies={replies} 
              onStatusChange={handleStatusChange} 
              onAddReply={handleAddReply} 
              onNavigate={handleNavigate} 
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-850 py-4 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} SupportPortal. Built for Customer Support Ticketing System Prototype.</p>
      </footer>

    </div>
  );
}

export default App;
