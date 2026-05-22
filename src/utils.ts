import { Contact } from "./types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function downloadVCard(contact: Contact) {
  const parts = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${contact.lastName};${contact.firstName};;;`,
    `FN:${contact.firstName} ${contact.lastName}`,
  ];

  if (contact.organization) {
    parts.push(`ORG:${contact.organization}`);
  }
  if (contact.title) {
    parts.push(`TITLE:${contact.title}`);
  }
  if (contact.phone) {
    parts.push(`TEL;TYPE=CELL:${contact.phone}`);
  }
  if (contact.email) {
    parts.push(`EMAIL;TYPE=PREF,INTERNET:${contact.email}`);
  }
  if (contact.address) {
    const escapedAddr = contact.address.replace(/,/g, "\\,");
    parts.push(`ADR;TYPE=WORK:;;${escapedAddr};;;;`);
  }
  if (contact.website) {
    parts.push(`URL:${contact.website}`);
  }
  if (contact.linkedin) {
    const handle = contact.linkedin.startsWith("http") ? contact.linkedin : `https://linkedin.com/in/${contact.linkedin}`;
    parts.push(`URL;type=linkedin:${handle}`);
  }
  if (contact.twitter) {
    const handle = contact.twitter.startsWith("http") ? contact.twitter : `https://twitter.com/${contact.twitter}`;
    parts.push(`URL;type=twitter:${handle}`);
  }
  if (contact.github) {
    const handle = contact.github.startsWith("http") ? contact.github : `https://github.com/${contact.github}`;
    parts.push(`URL;type=github:${handle}`);
  }

  // Handle Base64 avatar inside vCard
  if (contact.avatar && contact.avatar.includes("base64,")) {
    const sections = contact.avatar.split("base64,");
    if (sections.length === 2) {
      const mime = sections[0];
      const data = sections[1];
      const match = mime.match(/image\/([a-zA-Z]+);/);
      const ext = match ? match[1].toUpperCase() : "JPEG";
      parts.push(`PHOTO;ENCODING=b;TYPE=${ext}:${data}`);
    }
  }

  parts.push("END:VCARD");

  const vcardContent = parts.join("\r\n");
  const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${contact.firstName}_${contact.lastName}.vcf`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
