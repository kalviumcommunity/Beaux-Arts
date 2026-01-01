"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/Authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Apply = () => {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '', // Maps to DB: storeName
    website: '',
    instagram: '',
    portfolio: '',
    statement: '', // Maps to DB: bio
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast.error("You must be logged in to apply.");
        router.push('/auth');
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare data for the API
      // Since our schema is simple (storeName, bio), we combine some fields into bio
      const combinedBio = `${formData.statement}\n\nPortfolio: ${formData.portfolio}\nInstagram: ${formData.instagram}`;

      const response = await fetch('/api/artists/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            storeName: formData.storeName,
            bio: combinedBio
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(data.message || 'Application failed');
      }
    } catch (error) {
        console.error(error);
        toast.error('Something went wrong. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Success State ---
  if (submitted) {
    return (
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="font-display text-3xl md:text-4xl mb-4">
              Welcome to the Community!
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Your artist account has been created successfully. You can now start listing your artworks.
            </p>
            <Button onClick={() => router.push('/dashboard')} size="lg">
                Go to Artist Dashboard
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Sell Your Art
              <br />
              <span className="italic">With Beaux</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Join a curated community of artists and reach collectors worldwide. 
              We handle the logistics, marketing, and sales—so you can focus on what 
              you do best: creating.
            </p>

            <div className="space-y-6 border-t border-border pt-8">
              <div>
                <h3 className="font-display text-lg mb-2">Fair Commission</h3>
                <p className="text-muted-foreground text-sm">
                  Keep 80% of each sale. We only succeed when you do.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg mb-2">Global Reach</h3>
                <p className="text-muted-foreground text-sm">
                  Access to collectors from 12+ countries and growing.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg mb-2">Full Support</h3>
                <p className="text-muted-foreground text-sm">
                  Professional photography, shipping, and customer service included.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Auth Check Overlay */}
            {!isAuthenticated ? (
               <div className="h-full border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-secondary/10 border-dashed">
                  <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    You need to have a user account before applying to become a seller.
                  </p>
                  <Button onClick={() => router.push('/auth')}>Sign In / Sign Up</Button>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="storeName">Artist / Store Name</Label>
                    <Input
                        id="storeName"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Maya Chen Art"
                    />
                    <p className="text-xs text-muted-foreground">This will be your public display name.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://"
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram (Optional)</Label>
                    <Input
                        id="instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="@username"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio Link</Label>
                    <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={handleChange}
                    required
                    placeholder="Link to your portfolio (Behance, Dribbble, etc.)"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="statement">Artist Statement / Bio</Label>
                    <Textarea
                    id="statement"
                    name="statement"
                    value={formData.statement}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your work, your inspiration, and your background..."
                    />
                </div>

                <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            Submit Application
                            <Send className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
                </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Apply;