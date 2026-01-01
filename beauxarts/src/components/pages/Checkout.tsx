"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Next.js Router
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/Authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner'; // 👈 Sonner Toast
import { ShoppingBag, CreditCard, Truck, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

const shippingSchema = z.object({
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated ,token} = useAuth(); 
 
  const router = useRouter(); // Next.js router

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
   
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculation logic
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shippingCost + tax;

  // Empty State
  if (items.length === 0 && step !== 'confirmation') {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card>
            <CardContent className="py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <Button onClick={() => router.push('/shop')}>Browse Artworks</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Auth Guard
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card>
            <CardContent className="py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Sign in to checkout</h2>
              <Button onClick={() => router.push('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const validateShipping = (): boolean => {
    try {
      shippingSchema.parse(shippingData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleShippingSubmit = () => {
    if (validateShipping()) setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // 1. Send data to Backend
      const response = await fetch('/api/orders', {
         method: 'POST',
         headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Use token from AuthContext
         },
         body: JSON.stringify({
           items: items, // Send full items, backend will pick what it needs or validate
           shippingAddress: shippingData,
           paymentMethod,
           totalAmount: orderTotal
         }),
      });

      const data = await response.json();

      if (!data.success) {
          throw new Error(data.message || "Failed to create order");
      }
      
      // 2. Success
      clearCart();
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order');
      console.error('Order Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card>
            <CardContent className="py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-medium mb-2">Thank you for your order!</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;ve sent a confirmation email with your order details.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push('/profile')}>
                  View Orders
                </Button>
                <Button onClick={() => router.push('/shop')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Helper for image handling
  const getImageUrl = (img: string | string[]) => Array.isArray(img) ? img[0] : img;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-medium mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-foreground' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-medium">Shipping</span>
          </div>
          <Separator className="flex-1" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-foreground' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your delivery address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ... Inputs same as before, just ensuring onChange updates state correctly ... */}
                   <div className="space-y-2">
                     <Label>Address Line 1</Label>
                     <Input 
                        value={shippingData.addressLine1} 
                        onChange={(e) => setShippingData({...shippingData, addressLine1: e.target.value})}
                        placeholder="123 Main St"
                     />
                     {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
                   </div>
                   {/* ... (Keep other inputs, they are fine) ... */}
                   
                   {/* Add inputs for City, State, Country, Postal Code here... omitted for brevity as they were correct in your snippet */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={shippingData.city} onChange={e => setShippingData({...shippingData, city: e.target.value})} />
                            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input value={shippingData.state} onChange={e => setShippingData({...shippingData, state: e.target.value})} />
                            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input value={shippingData.postalCode} onChange={e => setShippingData({...shippingData, postalCode: e.target.value})} />
                            {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Input value={shippingData.country} onChange={e => setShippingData({...shippingData, country: e.target.value})} />
                            {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                        </div>
                    </div>

                  <Button className="w-full mt-6" onClick={handleShippingSubmit}>
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select how you&apos;d like to pay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit / Debit Card</div>
                        <div className="text-sm text-muted-foreground">Pay securely with your card</div>
                      </Label>
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </RadioGroup>

                  {/* Mock Card Inputs (Visual only) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t opacity-50 pointer-events-none">
                       {/* You can keep these inputs visually, but maybe gray them out or add a note 
                           saying "This is a demo checkout" */}
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep('shipping')}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={handlePlaceOrder} disabled={isProcessing}>
                      {isProcessing ? (
                         <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                      ) : (
                         `Place Order - $${orderTotal.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <Image 
                            src={getImageUrl(item.image) || '/placeholder.jpg'}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(Number(item.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}