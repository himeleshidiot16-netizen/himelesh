import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Globe, Mail, Phone, MapPin, Briefcase, Building, Linkedin, Twitter, Github } from "lucide-react";
import { Contact } from "../types";
import { fileToBase64 } from "../utils";

interface ContactModalProps {
  contact: Contact | null; // null if creating
  onClose: () => void;
  onSave: (contactData: Partial<Contact>) => Promise<void>;
}

export const ContactModal: React.FC<ContactModalProps> = ({ contact, onClose, onSave }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [avatar, setAvatar] = useState("");
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || "");
      setLastName(contact.lastName || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setTitle(contact.title || "");
      setOrganization(contact.organization || "");
      setWebsite(contact.website || "");
      setAddress(contact.address || "");
      setLinkedin(contact.linkedin || "");
      setTwitter(contact.twitter || "");
      setGithub(contact.github || "");
      setAvatar(contact.avatar || "");
    } else {
      // Clear fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setTitle("");
      setOrganization("");
      setWebsite("");
      setAddress("");
      setLinkedin("");
      setTwitter("");
      setGithub("");
      setAvatar("");
    }
  }, [contact]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Validate < 1.5 MB
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, avatar: "Image file is too large. Choose an image under 1.5 MB." }));
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      setAvatar(base64);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.avatar;
        return copy;
      });
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, avatar: "Error processing image file." }));
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        firstName,
        lastName,
        email,
        phone,
        title,
        organization,
        website,
        address,
        linkedin,
        twitter,
        github,
        avatar,
      });
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to save card." });
    } finally {
      setSaving(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold font-display text-zinc-100">
              {contact ? "Edit Business Card" : "New Digital Business Card"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Define metadata details and build your digital credentials</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer Split Container */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-12 md:gap-8">
          
          {/* Form Side - 7 cols on desktop */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-6">
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="Sarah"
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1 font-mono">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="Connor"
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1 font-mono">{errors.lastName}</p>}
              </div>
            </div>

            {/* Profile Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="Lead Security Consultant"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="Cyberdyne Corporation"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email URL / Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="sconnor@cyberdyne.io"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="+1 (555) 901-2015"
                />
              </div>
            </div>

            {/* Site and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Website URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="https://cyberdyne.io"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  HQ Location Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-250 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                  placeholder="Tech District, Block 4, Los Angeles, CA"
                />
              </div>
            </div>

            {/* Social handles */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-zinc-800/80">
                Social Profiles (Handles or Full URLs)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs"
                    placeholder="sarahconnor"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Twitter (X)
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs"
                    placeholder="sconnor_cyber"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs"
                    placeholder="sconnor-git"
                  />
                </div>
              </div>
            </div>

            {/* Drag & Drop Avatar Uploader */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Profile Photo (Avatar)
              </label>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-6 transition flex flex-col items-center justify-center cursor-pointer text-center ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-500/5" 
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {avatar ? (
                  <div className="flex items-center gap-4 text-left w-full max-w-sm">
                    <img 
                      src={avatar} 
                      alt="Avatar Preview" 
                      className="w-16 h-16 rounded-lg object-cover border border-zinc-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">Photo Loaded</p>
                      <p className="text-[10px] text-zinc-500">Base64 encoded string</p>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatar("");
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline mt-1"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                    <p className="text-xs font-medium text-zinc-300">
                      Drag & drop your portrait, or <span className="text-indigo-400 underline">browse computer</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG, or WEBP (Max size 1.5MB)</p>
                  </>
                )}
              </div>
              {errors.avatar && <p className="text-red-400 text-xs mt-1.5 font-mono">{errors.avatar}</p>}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-950/25 border border-red-900/30 text-red-400 rounded-lg text-xs font-mono">
                {errors.submit}
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wider transition shadow-lg cursor-pointer"
                disabled={saving}
              >
                {saving ? "Saving..." : "Publish Card"}
              </button>
            </div>
          </form>

          {/* Desktop Right Side - Live vCard Preview - 5 cols */}
          <div className="hidden md:col-span-5 md:block border-l border-zinc-800 pl-8 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Live Business Card Preview
            </h4>
            
            {/* The Live Interactive Visual Card Card Board */}
            <div className="relative w-full aspect-[2/3] max-w-sm mx-auto rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between shadow-2xl">
              
              {/* Outer decorative mesh blob */}
              <div className="absolute top-[-20%] right-[-20%] w-[180px] h-[180px] rounded-full bg-indigo-800/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-25%] left-[-25%] w-[200px] h-[200px] rounded-full bg-zinc-950 border border-white/5 pointer-events-none"></div>

              {/* vCard Body Content */}
              <div className="p-7 z-10 space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Header Profile Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">CARDNET IDENTITY</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[8px] font-mono text-zinc-400">ACTIVE</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt="Preview" 
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-800 bg-zinc-900/50" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-bold text-indigo-400 text-lg uppercase shadow-inner">
                        {firstName ? firstName[0] || "" : ""}{lastName ? lastName[0] || "" : ""}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h5 className="font-display font-medium text-base text-zinc-150 tracking-tight truncate">
                        {firstName || "First"} {lastName || "Last"}
                      </h5>
                      <p className="text-xs text-indigo-400 font-medium truncate">{title || "Your Professional Title"}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{organization || "Your Organization"}</p>
                    </div>
                  </div>
                </div>

                {/* Micro Actions Frosted Row */}
                <div className="grid grid-cols-4 gap-2 bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl p-2.5 my-2">
                  <div className={`p-2 flex items-center justify-center rounded-lg text-zinc-400 ${email ? 'text-indigo-400 bg-indigo-500/5' : 'opacity-30'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className={`p-2 flex items-center justify-center rounded-lg text-zinc-400 ${phone ? 'text-indigo-400 bg-indigo-500/5' : 'opacity-30'}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className={`p-2 flex items-center justify-center rounded-lg text-zinc-400 ${address ? 'text-indigo-400 bg-indigo-500/5' : 'opacity-30'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className={`p-2 flex items-center justify-center rounded-lg text-zinc-400 ${website ? 'text-indigo-400 bg-indigo-500/5' : 'opacity-30'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                </div>

                {/* Fields details list */}
                <div className="space-y-2.5 text-xs text-zinc-400 flex-1 flex flex-col justify-center">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate text-[11px] font-mono">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="text-[11px] font-mono">{phone}</span>
                    </div>
                  )}
                  {address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate text-[11px]">{address}</span>
                    </div>
                  )}
                </div>

                {/* Branding footer */}
                <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-600">CARDNET ENGINE v1.0</span>
                  
                  {/* Dynamic mini-social representation */}
                  <div className="flex gap-2">
                    {linkedin && <Linkedin className="w-3.5 h-3.5 text-zinc-500" />}
                    {twitter && <Twitter className="w-3.5 h-3.5 text-zinc-500" />}
                    {github && <Github className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>
                </div>

              </div>
            </div>
            
            <p className="text-center text-[10px] text-zinc-500 italic max-w-xs mx-auto">
              This card renders dynamically in real-time. Share links will resolve identical cards automatically.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
