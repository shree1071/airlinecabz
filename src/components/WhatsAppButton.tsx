import { generateWhatsAppLink } from "@/lib/whatsapp-helper";
import { Booking } from "@/types";

type WhatsAppButtonProps = {
  booking: Booking;
  variant?: "default" | "small" | "icon";
  className?: string;
};

export default function WhatsAppButton({ booking, variant = "default", className = "" }: WhatsAppButtonProps) {
  const whatsappLink = generateWhatsAppLink(booking);

  if (variant === "icon") {
    return (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${className}`}
        title="Send WhatsApp confirmation"
      >
        <span className="text-lg">💬</span>
      </a>
    );
  }

  if (variant === "small") {
    return (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors ${className}`}
        title="Send WhatsApp confirmation"
      >
        <span className="text-sm">💬</span>
        Send
      </a>
    );
  }

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm ${className}`}
      title="Send WhatsApp confirmation"
    >
      <span className="text-lg">💬</span>
      WhatsApp
    </a>
  );
}
