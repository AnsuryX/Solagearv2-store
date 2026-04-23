import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sun } from 'lucide-react';

const WA_LINK = `https://wa.me/254141153031?text=Hi%20SolarGear!%20I%27d%20like%20to%20learn%20more%20about%20solar%20for%20my%20home%20or%20business%20in%20Kenya.`;
const QUICK_MSGS = [
  { label: 'Get a free quote', text: 'Hi SolarGear! I\'d like a free solar quote for my home.' },
  { label: 'Ask about financing', text: 'Hi! Can you tell me about your solar financing / payment plans?' },
  { label: 'Book site assessment', text: 'Hi! I\'d like to book a free solar site assessment.' },
  { label: 'Check product prices', text: 'Hi! Can I get your current product pricing and availability?' },
];

export default function StickyWhatsApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-background border hairline border-border rounded-sm shadow-xl w-72 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-heading font-semibold text-sm">SolarGear Kenya</p>
                <p className="text-green-100 text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" /> Usually replies within 1 hour
                </p>
              </div>
            </div>

            {/* Chat bubble */}
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm text-xs text-gray-700 mb-1">
                👋 Hello! How can we help you go solar today? Choose a topic below or type your own message.
              </div>
              <p className="text-[10px] text-gray-400 ml-1">SolarGear Team · just now</p>
            </div>

            {/* Quick replies */}
            <div className="p-3 border-t hairline border-border space-y-1.5">
              {QUICK_MSGS.map((msg, i) => (
                <a
                  key={i}
                  href={`https://wa.me/254141153031?text=${encodeURIComponent(msg.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-sm bg-muted hover:bg-green-50 hover:border-green-200 border hairline border-transparent transition-all text-xs font-medium text-foreground group"
                >
                  {msg.label}
                  <MessageCircle className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            <div className="px-3 pb-3">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-sm text-sm font-heading font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Open WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-30" />
        )}
      </motion.button>
    </div>
  );
}