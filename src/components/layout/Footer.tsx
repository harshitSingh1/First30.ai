import { Link } from 'react-router-dom';
import { Shield, Heart, Lock } from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandLogo size="lg" />
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Step-by-step emergency guidance for the critical first 30 minutes. 
              Designed for panic situations, built for saving lives.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/citizen" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Emergency Help
              </Link>
              <Link to="/dispatcher" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Dispatcher Mode
              </Link>
              <Link to="/map" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Nearby Services
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Trust Points */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Our Promise</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>No login required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                <span>Panic-proof design</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Privacy-first</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 First30.ai. For emergencies, always call your local emergency number.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">
              Safety Guidelines
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              Disclaimer
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
