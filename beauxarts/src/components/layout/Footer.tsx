import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-medium tracking-tight">
              Beaux
            </Link>
            <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              Curating exceptional art from emerging and established artists worldwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[13px] font-medium mb-4">Shop</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/shop" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link href="/shop?category=Paintings" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Paintings
              </Link>
              <Link href="/shop?category=Photography" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Photography
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-medium mb-4">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/artists" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Artists
              </Link>
              {/* Note: Ensure you have an /apply route created for this Link */}
              <Link href="/apply" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Sell With Us
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-medium mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-[13px] text-muted-foreground">
              <a href="mailto:hello@beaux.art" className="hover:text-foreground transition-colors">
                hello@beaux.art
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-[12px] text-muted-foreground">
          <p>© 2024 Beaux</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}