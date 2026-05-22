import React, { useState, useEffect } from "react";
import { 
  Users, Plus, Search, Database, RefreshCw, 
  HelpCircle, Sparkles, Filter, Grid, ShieldAlert 
} from "lucide-react";
import { Contact, DbConfig } from "../types";
import { DbIndicator } from "./DbIndicator.js";
import { ContactCard } from "./ContactCard.js";
import { ContactModal } from "./ContactModal.js";
import { ShareModal } from "./ShareModal.js";

export const DashboardView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const [activeModalContact, setActiveModalContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareContact, setShareContact] = useState<Contact | null>(null);

  // Load configs and contacts
  useEffect(() => {
    fetchDbConfig();
    fetchContacts();
  }, []);

  const fetchDbConfig = async (force: boolean = false) => {
    try {
      setLoadingConfig(true);
      const url = force ? "/api/config?force=true" : "/api/config";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDbConfig(data);
    } catch {
      setDbConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await fetch("/api/contacts");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch contacts: ${res.status}`);
      }
      const data = await res.json();
      setContacts(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load active connections. Verify connectivity.");
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleCreateNew = () => {
    setActiveModalContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setActiveModalContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to retire this digital business card?")) {
      return;
    }

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete card.");
      }

      // Success, remove from list
      setContacts(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleShare = (contact: Contact) => {
    setShareContact(contact);
  };

  const handleSaveContact = async (contactData: Partial<Contact>) => {
    try {
      const url = activeModalContact 
        ? `/api/contacts/${activeModalContact._id}` 
        : "/api/contacts";
      const method = activeModalContact ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save card metadata.");
      }

      const savedContact = await res.json();

      if (activeModalContact) {
        // Edit flow
        setContacts(prev => prev.map(c => c._id === savedContact._id ? savedContact : c));
      } else {
        // Create flow
        setContacts(prev => [savedContact, ...prev]);
      }

      setIsModalOpen(false);
      setActiveModalContact(null);
    } catch (err: any) {
      console.error(err);
      throw err; // Forward to modal to display error
    }
  };

  // Filter contacts by dynamic search
  const filteredContacts = contacts.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesFirst = c.firstName?.toLowerCase().includes(query) || false;
    const matchesLast = c.lastName?.toLowerCase().includes(query) || false;
    const matchesOrg = c.organization?.toLowerCase().includes(query) || false;
    const matchesTitle = c.title?.toLowerCase().includes(query) || false;
    const matchesEmail = c.email?.toLowerCase().includes(query) || false;
    const matchesPhone = c.phone?.toLowerCase().includes(query) || false;

    return matchesFirst || matchesLast || matchesOrg || matchesTitle || matchesEmail || matchesPhone;
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-zinc-100 font-sans">
      
      {/* Sidebar Layout */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0">
        
        {/* Brand Banner */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="font-display font-black text-white text-base">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-tight text-white">CARDNET</span>
              <span className="text-[9px] font-mono font-medium tracking-wider text-zinc-500 uppercase">Enterprise Node</span>
            </div>
          </div>
          <button 
            onClick={() => fetchDbConfig(true)}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-550 hover:text-zinc-300 transition"
            title="Refresh database connection verification"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-3 mb-2">
            Workspace
          </div>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 font-semibold text-xs tracking-wide rounded-md border border-indigo-500/20 text-left transition"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Contacts Directory
          </button>
        </nav>

        {/* Database Status Indicator bottom sidebar anchor */}
        <div className="p-4 border-t border-zinc-800">
          <DbIndicator 
            config={dbConfig} 
            loading={loadingConfig} 
            onRefresh={() => fetchDbConfig(true)} 
          />
        </div>

      </aside>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Toolbar */}
        <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              Contacts Management
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            </h1>
            <p className="text-[10px] text-zinc-550 uppercase tracking-widest mt-0.5 font-semibold">
              Live Active Directory • {contacts.length} Enterprise Cards
            </p>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Card
          </button>
        </header>

        {/* Core content scroll feed */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-zinc-950">
          
          {/* Filter Toolbar row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, organization, title, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            {/* Active search tag indicators */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-905 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-mono">
              <Filter className="w-3 h-3 text-indigo-400" />
              <span>Visible: <b>{filteredContacts.length}</b>/{contacts.length} cards</span>
            </div>
          </div>

          {/* Contacts Grid section */}
          {loadingContacts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg bg-zinc-800"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-800 rounded w-full"></div>
                    <div className="h-3 bg-zinc-800 rounded w-4/5"></div>
                  </div>
                  <div className="h-8 bg-zinc-805 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact._id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            /* Elegant empty state */
            <div className="border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl p-12 text-center max-w-lg mx-auto flex flex-col items-center space-y-4">
              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-zinc-650" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-sm text-zinc-250">No digital cards published</h3>
                <p className="text-xs text-zinc-500">
                  {searchQuery 
                    ? "Adjust search parameters to locate other matching employees" 
                    : "Establish credentials by publishing your first corporate digital business card."}
                </p>
              </div>
              {!searchQuery && (
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-900/30 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish First Card
                </button>
              )}
            </div>
          )}

        </div>

      </main>

      {/* Embedded Modals Overlay hooks */}
      {isModalOpen && (
        <ContactModal
          contact={activeModalContact}
          onClose={() => {
            setIsModalOpen(false);
            setActiveModalContact(null);
          }}
          onSave={handleSaveContact}
        />
      )}

      {shareContact && (
        <ShareModal
          contact={shareContact}
          onClose={() => setShareContact(null)}
        />
      )}

    </div>
  );
};
