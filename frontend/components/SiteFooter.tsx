import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full bg-card border-t border-border py-12 transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 md:gap-24 w-full">
          
          {/* Brand */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3">
              <Image src="/logo.svg" alt="SmartCart" width={48} height={36} />
              <span className="font-serif text-3xl italic text-foreground">SmartCart</span>
            </div>
            <p className="text-[15px] leading-relaxed text-muted-foreground max-w-[320px]">
              We are a modern electronics store always looking for new and creative ideas
              to help you with our products in your everyday work.
            </p>
            <Link href="/products" className="inline-block text-[15px] text-primary transition-colors hover:text-accent font-medium">
              Our Products
            </Link>
          </div>

          {/* Contact */}
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="font-serif text-2xl italic text-foreground tracking-wide">Contact</h3>
            <ul className="space-y-4 text-[15px] text-muted-foreground flex flex-col items-center">
              <li className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>123 Tech Street, Assiut, Egypt</span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Phone: <a href="https://wa.me/201212192694" className="text-primary transition-colors hover:text-accent">(+20) 1212192694</a>
                </span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Email: <a href="mailto:admin@smartcart.com" className="text-primary transition-colors hover:text-accent">admin@smartcart.com</a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 w-full border-t border-border pt-6 text-center text-xs text-muted-foreground max-w-4xl">
          © {new Date().getFullYear()} SmartCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
