import React, { useState } from "react";
import { 
  Phone, Mail, Globe, Linkedin, Twitter, Github, 
  Edit, Trash2, Share2, Copy, Check, MapPin 
} from "lucide-react";
import { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onShare: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onShare }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const getInitials = () => {
    return `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase();
  };

  const getShareUrl = () => {
    const origin = window.location.origin;
    return `${origin}/card/${contact._id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const normalizeUrl = (val: string, prefix: string) => {
    if (!val) return "";
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    return prefix + val;
  };

  return (
    <div className="relative overflow-hidden flex flex-col justify-between h-full bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 transition-all duration-300 group shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 group-hover:bg-indigo-500 transition-colors"></div>
      
      {/* Card Header & Profile */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {contact.avatar ? (
            <img 
              src={contact.avatar} 
              alt={`${contact.firstName} ${contact.lastName}`} 
              className="w-16 h-16 rounded-md object-cover bg-zinc-800 border border-zinc-700 shadow-inner"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center font-display font-bold text-lg text-indigo-400 shadow-inner">
              {getInitials()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-zinc-100 group-hover:text-indigo-400 transition truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.title && (
              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mt-0.5 truncate">{contact.title}</p>
            )}
            {contact.organization && (
              <p className="text-xs text-indigo-400 mt-0.5 truncate">{contact.organization}</p>
            )}
          </div>
        </div>

        {contact.address && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}

        {/* Social Badges and Icons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {contact.website && (
            <a 
              href={normalizeUrl(contact.website, "https://")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-indigo-400 rounded transition"
              title="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {contact.linkedin && (
            <a 
              href={normalizeUrl(contact.linkedin, "https://linkedin.com/in/")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-indigo-400 rounded transition"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {contact.twitter && (
            <a 
              href={normalizeUrl(contact.twitter, "https://twitter.com/")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-indigo-400 rounded transition"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {contact.github && (
            <a 
              href={normalizeUrl(contact.github, "https://github.com/")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-indigo-400 rounded transition"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Muted direct contact fonts, explicitly below social icons */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-col gap-1.5">
          {contact.email && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Mail className="w-3.5 h-3.5 text-zinc-600" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Phone className="w-3.5 h-3.5 text-zinc-600" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-zinc-950/30 border-t border-zinc-800/80 flex items-center justify-between gap-2 rounded-b-md">
        <button
          onClick={() => onEdit(contact)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-350 hover:text-white rounded text-xs font-semibold transition cursor-pointer border border-zinc-800/40"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>

        <button
          onClick={() => onShare(contact)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded text-xs font-semibold border border-indigo-500/20 transition cursor-pointer"
          title="Share digital card net link"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>

        <button
          onClick={handleCopyLink}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition duration-205 flex items-center ${
            copiedLink 
              ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30" 
              : "bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-250 border border-zinc-800/40"
          }`}
          title="Copy Public Card Link"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onDelete(contact._id)}
          className="p-1.5 hover:bg-red-950/25 text-zinc-500 hover:text-red-400 rounded transition"
          title="Delete Contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
