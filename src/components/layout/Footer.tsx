import { NavLink } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 text-sm text-muted-foreground">
        <p>&copy; {currentYear} Masterplan. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          <NavLink to="/terms" className="hover:text-primary transition-colors">
            Terms
          </NavLink>
          <NavLink to="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </NavLink>
          <NavLink to="/support" className="hover:text-primary transition-colors">
            Support
          </NavLink>
        </nav>
      </div>
    </footer>
  );
} 