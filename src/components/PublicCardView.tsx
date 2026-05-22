import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Phone, Mail, MessageSquare, MapPin, Globe, 
  Linkedin, Twitter, Github, Plus, Share2, 
  ArrowLeft, Download, ExternalLink, Calendar 
} from "lucide-react";
import { Contact } from "../types";
import { downloadVCard } from "../utils";
import { ShareModal } from "./ShareModal.js";

export const PublicCardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchCard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/contacts/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setContact(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading credit card profile:", err);
        setError(err.message || "Failed to load card details.");
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [id]);

  const normalizeSocialUrl = (handle: string, prefix: string) => {
    if (!handle) return "";
    if (handle.startsWith("http://") || handle.startsWith("https://")) {
      return handle;
    }
    return prefix + handle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6 animate-pulse">
          {/* Skeleton Profile Banner */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-zinc-800"></div>
            <div className="h-6 w-36 bg-zinc-800 rounded"></div>
            <div className="h-4 w-28 bg-zinc-800 rounded"></div>
            <div className="h-3 w-44 bg-zinc-800 rounded"></div>
          </div>
          
          {/* Skeleton Actions */}
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded-xl"></div>
            ))}
          </div>

          {/* Skeleton List */}
          <div className="space-y-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800/60 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-red-950/25 border border-red-900/30 text-red-400 rounded-full">
          <ArrowLeft className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-zinc-150">Business Card Not Found</h2>
        <p className="text-zinc-500 text-sm max-w-sm">
          {error || "The digital card parameters or identifier you accessed is invalid or has been pulled down."}
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-850 text-xs font-semibold text-zinc-300 rounded-lg hover:bg-zinc-805 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const initials = `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Dynamic graphic lighting glow */}
      <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>

      {/* Main Core Container */}
      <div className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        
        {/* Floating dashboard link for administrative convenience */}
        <div className="mb-4 z-10 self-start">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-md text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>

        {/* The Card Board - Sharp Slate UI */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-6 sm:p-8 space-y-7 shadow-2xl relative">
          
          {/* Top segment profile banner */}
          <div className="flex flex-col items-center text-center space-y-4">
            {contact.avatar ? (
              <img 
                src={contact.avatar} 
                alt={`${contact.firstName} ${contact.lastName}`} 
                className="w-24 h-24 rounded-md object-cover bg-zinc-800 border border-zinc-700 shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-md bg-zinc-800 border border-zinc-750 flex items-center justify-center font-display font-bold text-3xl text-indigo-400 shadow-inner">
                {initials}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="font-display font-semibold text-2xl text-zinc-100 tracking-tight">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.title && (
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">{contact.title}</p>
              )}
              {contact.organization && (
                <p className="text-xs text-indigo-400 font-semibold">{contact.organization}</p>
              )}
            </div>
          </div>

          {/* Middle: 4 Quick Actions (Phone, Email, SMS, Map) */}
          <div className="grid grid-cols-4 gap-3">
            {contact.phone ? (
              <a 
                href={`tel:${contact.phone}`}
                className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-805 rounded-md transition group"
                title="Call phone line"
              >
                <Phone className="w-5 h-5 text-zinc-300 group-hover:text-indigo-400 transition" />
                <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/10 border border-zinc-800/10 rounded-md opacity-20">
                <Phone className="w-5 h-5" />
                <span className="text-[10px] mt-1.5">Call</span>
              </div>
            )}

            {contact.email ? (
              <a 
                href={`mailto:${contact.email}`}
                className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-805 rounded-md transition group"
                title="Send email message"
              >
                <Mail className="w-5 h-5 text-zinc-300 group-hover:text-indigo-400 transition" />
                <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">Email</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/10 border border-zinc-800/10 rounded-md opacity-20">
                <Mail className="w-5 h-5" />
                <span className="text-[10px] mt-1.5">Email</span>
              </div>
            )}

            {contact.phone ? (
              <a 
                href={`sms:${contact.phone}`}
                className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-805 rounded-md transition group"
                title="Text SMS line"
              >
                <MessageSquare className="w-5 h-5 text-zinc-300 group-hover:text-indigo-400 transition" />
                <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">SMS</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/10 border border-zinc-800/10 rounded-md opacity-20">
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px] mt-1.5">SMS</span>
              </div>
            )}

            {contact.address ? (
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-805 rounded-md transition group"
                title="Open location in map"
              >
                <MapPin className="w-5 h-5 text-zinc-300 group-hover:text-indigo-400 transition" />
                <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">Map</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3.5 bg-zinc-800/10 border border-zinc-800/10 rounded-md opacity-20">
                <MapPin className="w-5 h-5" />
                <span className="text-[10px] mt-1.5">Map</span>
              </div>
            )}
          </div>

          {/* Mandatory Specs: Display email, phone, address vertically in a row container with label & values */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">
              Contact Information
            </h3>
            
            <div className="space-y-2.5">
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3.5 p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition"
                >
                  <div className="p-2.5 bg-indigo-500/10 rounded-md text-indigo-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Phone Helpline</p>
                    <p className="text-sm font-semibold font-mono text-zinc-200 truncate">{contact.phone}</p>
                  </div>
                </a>
              )}

              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3.5 p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition"
                >
                  <div className="p-2.5 bg-indigo-500/10 rounded-md text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Email Address</p>
                    <p className="text-sm font-semibold font-mono text-zinc-200 truncate">{contact.email}</p>
                  </div>
                </a>
              )}

              {contact.address && (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition"
                >
                  <div className="p-2.5 bg-indigo-500/10 rounded-md text-indigo-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Corporate Location</p>
                    <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{contact.address}</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Lower Segment: Social profile links as frosted glass cards */}
          {(contact.website || contact.linkedin || contact.twitter || contact.github) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">
                Connected Profiles
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {contact.website && (
                  <a 
                    href={normalizeSocialUrl(contact.website, "https://")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-400 transition" />
                      <span className="text-xs text-zinc-300 truncate font-semibold font-display font-medium">Website</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                )}

                {contact.linkedin && (
                  <a 
                    href={normalizeSocialUrl(contact.linkedin, "https://linkedin.com/in/")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Linkedin className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-400 transition" />
                      <span className="text-xs text-zinc-300 truncate font-semibold font-display font-medium">LinkedIn</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                )}

                {contact.twitter && (
                  <a 
                    href={normalizeSocialUrl(contact.twitter, "https://twitter.com/")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Twitter className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-400 transition" />
                      <span className="text-xs text-zinc-300 truncate font-semibold font-display font-medium">Twitter (X)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                )}

                {contact.github && (
                  <a 
                    href={normalizeSocialUrl(contact.github, "https://github.com/")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-zinc-805/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-md transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Github className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-400 transition" />
                      <span className="text-xs text-zinc-300 truncate font-semibold font-display font-display">GitHub</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Bottom actions: "Add to Contacts" (generate local .vcf file) & "Share" */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => downloadVCard(contact)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-bold transition shadow-lg shadow-indigo-600/10 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Add to Contacts (.vcf)
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white rounded-md text-xs font-bold transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share Digital Card
            </button>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="p-6 text-center text-[10px] text-zinc-600 tracking-wider">
        <span>POWERED BY CARDNET • ENTERPRISE IDENTITIES</span>
      </div>

      {showShare && (
        <ShareModal 
          contact={contact} 
          onClose={() => setShowShare(false)} 
        />
      )}
    </div>
  );
};
