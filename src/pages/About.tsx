import Layout from '@/components/layout/Layout';
import { Shield, AlertTriangle, Heart, Users, Mail, Activity } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl border border-white/20 flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <img
              src="/assets/logo.png"
              alt="First30.ai Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-heading-1 text-foreground mb-4">About First30.ai</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Emergency guidance for the critical first 30 minutes
          </p>
        </div>

        {/* Mission */}
        <section className="premium-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-heading-3 text-foreground">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            First30.ai provides step-by-step emergency guidance for the critical first 30 minutes before professional help arrives. We believe everyone should have access to life-saving knowledge in moments of crisis.
          </p>
        </section>

        {/* Safety Guidelines */}
        <section className="premium-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-heading-3 text-foreground">Safety Guidelines</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Always call emergency services (911) first
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Ensure your own safety before helping others
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Follow instructions step by step
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Stay calm and speak clearly
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Do not move injured persons unless necessary
            </li>
          </ul>
        </section>

        {/* Disclaimer */}
        <section className="premium-card p-6 border-amber-500/20 bg-amber-500/5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-heading-3 text-foreground">Medical Disclaimer</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            First30.ai is designed to provide general emergency guidance and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers. In case of emergency, call your local emergency number immediately. The creators of First30.ai are not liable for any actions taken based on the information provided.
          </p>
        </section>

        {/* Contact */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-heading-3 text-foreground">Contact</h2>
          </div>
          <p className="text-muted-foreground">
            Questions or feedback? Email us at <span className="text-primary font-medium">support@first30.ai</span>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default About;
