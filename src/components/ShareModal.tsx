import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Contact } from "../types";

interface ShareModalProps {
  contact: Contact | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ contact, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!contact) return null;

  const origin = window.location.origin;
  const cardUrl = `${origin}/card/${contact._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullName = () => {
    return `${contact.firstName} ${contact.lastName}`;
  };

  // Helper code to transfer SVG content into a PNG download dynamically
  const downloadQRCode = () => {
    const svgElement = document.getElementById("share-qr-svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        // Draw image keeping ratio
        context.drawImage(image, 20, 20, 360, 360);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${contact.firstName}_${contact.lastName}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    };
    image.src = blobUrl;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div>
            <h3 className="font-display font-semibold text-lg text-zinc-150">Share Business Card</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Let contacts scan or browse your active card</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Segment */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-xl border border-zinc-200">
            <QRCodeSVG
              id="share-qr-svg"
              value={cardUrl}
              size={180}
              level={"H"}
              includeMargin={false}
            />
          </div>
          
          <button
            onClick={downloadQRCode}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <Download className="w-4 h-4" />
            Download QR Code Image
          </button>
        </div>

        {/* Action Link Details */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Card Access Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={cardUrl}
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-indigo-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition ${
                copied 
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
                  : "bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 border-zinc-750"
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
              ) : (
                <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy</span>
              )}
            </button>
          </div>
        </div>

        {/* Info card overview */}
        <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-300 truncate">{getFullName()}</p>
            <p className="text-[10px] text-zinc-500 truncate">{contact.organization || contact.title || "CARDNET Card"}</p>
          </div>
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-1 px-2.5 bg-indigo-600/10 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold rounded"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
