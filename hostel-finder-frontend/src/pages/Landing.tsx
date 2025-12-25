import { Link } from "react-router-dom";
import { Building2, Search, Shield, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { PolicyDialogs } from "@/components/PolicyDialogs";
import HostelCarousel from "@/components/HostelCarousel";

const Landing = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find hostels by city, rent budget, and facilities with our advanced search filters."
    },
    {
      icon: Shield,
      title: "Verified Listings",
      description: "All hostels are verified by our admin team for authenticity and safety."
    },
    {
      icon: Users,
      title: "Student Reviews",
      description: "Read genuine reviews from fellow students before making your decision."
    },
    {
      icon: Star,
      title: "Top Rated",
      description: "Discover top-rated hostels based on student feedback and ratings."
    }
  ];

  const stats = [
    { value: "50+", label: "Verified Hostels" },
    { value: "5K+", label: "Happy Students" },
    { value: "15+", label: "Cities Covered" },
    { value: "4.5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Trusted by 5,000+ Students
                </span>
              </div>
              <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight">
                Find Your Perfect
                <span className="text-primary block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Student Hostel
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                HostelGo makes finding verified, affordable student accommodation easy. 
                Search by location, budget, and amenities to find your ideal home away from home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2 hover:bg-accent/10 transition-all duration-300">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
              <div className="relative">
                <HostelCarousel autoSlideInterval={5000} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-primary/95 to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <p className="font-heading text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                  {stat.value}
                </p>
                <p className="text-primary-foreground/90 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Choose HostelGo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're committed to making your hostel search experience seamless and reliable. HostelGo helps students and residents discover verified hostels, compare options easily, and make informed decisions based on location, pricing, and amenities — all from one trusted platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card border-2 border-border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted via-muted/50 to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
              Built for <span className="text-primary">Everyone</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you're a student, hostel owner, or administrator
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-4 group-hover:text-primary transition-colors">For Students</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Browse verified hostels</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Search & filter by preferences</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Read & write reviews</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -z-10" />
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-4 group-hover:text-primary transition-colors">For Hostel Owners</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>List your properties</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Manage hostel details</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Get verified status</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-4 group-hover:text-primary transition-colors">For Admins</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Verify hostel listings</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Manage all properties</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Platform analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-12 shadow-2xl">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to Find Your Hostel?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Start your search with HostelGo and explore verified accommodations tailored to your needs. Whether you're a student or a resident, finding the right place has never been easier.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-heading font-bold text-lg">HostelGo</span>
              </div>
              <p className="text-background/70 text-sm">
                Your trusted platform for finding verified student hostels across Pakistan.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li>
                  <Link to="/" className="hover:text-background transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-background transition-colors">Sign Up</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-background transition-colors">Login</Link>
                </li>
              </ul>
            </div>

            {/* For Users */}
            <PolicyDialogs>
              {(openPrivacy, openTerms, openAbout, openHowItWorks) => (
                <div>
                  <h4 className="font-semibold mb-4">For Users</h4>
                  <ul className="space-y-2 text-sm text-background/70">
                    <li>
                      <Link to="/student/hostels" className="hover:text-background transition-colors">Browse Hostels</Link>
                    </li>
                    <li>
                      <Link to="/owner/dashboard" className="hover:text-background transition-colors">List Your Hostel</Link>
                    </li>
                    <li>
                      <button 
                        onClick={openHowItWorks}
                        className="hover:text-background transition-colors cursor-pointer"
                      >
                        How It Works
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </PolicyDialogs>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li>Email: support@hostelgo.pk</li>
                <li>Phone: +92 300 1234567</li>
                <li>Address: Lahore, Pakistan</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <PolicyDialogs>
            {(openPrivacy, openTerms, openAbout, openHowItWorks) => (
              <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-background/70 text-sm">
                  © 2024 HostelGo. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm text-background/70">
                  <button 
                    onClick={openPrivacy}
                    className="hover:text-background transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={openTerms}
                    className="hover:text-background transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                  <button 
                    onClick={openAbout}
                    className="hover:text-background transition-colors cursor-pointer"
                  >
                    About Us
                  </button>
                </div>
              </div>
            )}
          </PolicyDialogs>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
