import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function OrderConfirmed() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('id');
  const email = searchParams.get('email');
  const friendlyId = orderId ? orderId.substring(0, 8).toUpperCase() : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        </motion.div>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
          Order Confirmed
        </h1>
        {friendlyId && (
          <p className="text-xs font-mono bg-muted text-muted-foreground inline-block px-3 py-1 rounded-sm mb-4">
            Order ID: #{friendlyId}
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Thank you for choosing SolarGear. Your order has been placed successfully. 
          You'll receive a confirmation email with tracking details shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track-order?orderId=${friendlyId || orderId}&email=${email || ''}&auto=true`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm group px-8">
              Track Your Order
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="font-heading rounded-sm">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}