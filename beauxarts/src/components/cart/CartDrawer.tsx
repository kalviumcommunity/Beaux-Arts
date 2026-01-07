"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout'); 
  };

  // Helper to handle string | string[] for images
  const getImageUrl = (img: string | string[]) => {
    if (Array.isArray(img)) return img[0];
    return img;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-secondary rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button 
                    variant="link" 
                    onClick={() => { setIsCartOpen(false); router.push('/shop'); }}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(item.image) || '/placeholder.jpg'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-display text-sm line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.artist}</p>
                        <p className="text-sm mt-1">${Number(item.price).toLocaleString()}</p>
                        
                        <div className="mt-auto flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-secondary rounded-sm transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm w-6 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-secondary rounded-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4 bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-lg">${totalPrice.toLocaleString()}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Checkout
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}