import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl tracking-tight">
              Beaux
            </Link>
            <p className="mt-4 text-muted-foreground font-body text-sm max-w-md leading-relaxed">
              Curating exceptional art from emerging and established artists worldwide. 
              Every piece tells a story, every purchase supports an artist in their  journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shop All
              </Link>
              <Link href="/artists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Artists
              </Link>
              <Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sell With Us
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:hello@beaux.art" className="hover:text-foreground transition-colors">
                hello@beaux.art
              </a>
              <p>New York, NY</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2024 Beaux. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

