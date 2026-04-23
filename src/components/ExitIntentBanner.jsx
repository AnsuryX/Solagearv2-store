import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Gift } from 'lucide-react';

const WA_LINK = `https://wa.me/254700000000?text=Hi%20SolarGear!%20I%20saw%20the%20limited%20offer%20and%20I%27d%20like%20to%20claim%20my%20free%20solar%20assessment%20and%20discount.`;

export default function ExitIntentBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || sessionStorage.getItem('exit_banner_dismissed')) return;

    // Show after 45s on page
    const timer = setTimeout(() => {
      if (!dismissed) setShow(true);
    }, 45000);

    // Also show on mouse leaving viewport (exit intent)
    const onMouseLeave = (e) => {
      if (e.clientY <= 0 && !dismissed && !sessionStorage.getItem('exit_banner_dismissed')) {
        setShow(true);
      }
    };
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [dismissed]);

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('exit_banner_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-foreground/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && dismiss()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-background rounded-sm border hairline border-border shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-yellow-400" />

            <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-7 h-7 text-primary" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Wait — Special Offer</p>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Get a Free Site Assessment Worth KSh 5,000
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Before you go — claim a <strong>free solar site assessment</strong> for your home or business in Nairobi. Our engineers will visit, measure your roof, and give you a detailed quote at no cost.
              </p>
              <p className="text-xs text-orange-600 font-medium mb-6">🔥 Limited slots available this week</p>

              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={dismiss}>
                <button className="w-full bg-green-600 hover:bg-green-500 text-white font-heading font-semibold py-3 px-6 rounded-sm flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Claim Free Assessment on WhatsApp
                </button>
              </a>
              <button onClick={dismiss} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                No thanks, I'll pay full price later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}