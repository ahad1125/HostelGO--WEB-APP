import { Link } from "react-router-dom";
import { Building2, Search, Shield, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

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
    { value: "500+", label: "Verified Hostels" },
    { value: "10K+", label: "Happy Students" },
    { value: "50+", label: "Cities Covered" },
    { value: "4.5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Find Your Perfect
                <span className="text-primary block">Student Hostel</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                HostelGo makes finding verified, affordable student accommodation easy. 
                Search by location, budget, and amenities to find your ideal home away from home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=60"
                  alt="Modern hostel room"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-accent">Verified Hostel</span>
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-1">Gulberg Boys Hostel</h3>
                  <p className="text-muted-foreground">Lahore • Rs 15,000/month</p>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-card border-2 border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl">4.8</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-heading text-4xl lg:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
              Why Choose HostelGo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to making your hostel search experience seamless and reliable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you're a student, hostel owner, or administrator
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3">For Students</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Browse verified hostels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Search & filter by preferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Read & write reviews
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3">For Hostel Owners</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  List your properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Manage hostel details
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Get verified status
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-3">For Admins</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Verify hostel listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Manage all properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Platform analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-6">
            Ready to Find Your Hostel?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who have found their perfect accommodation through HostelGo.
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-heading font-bold text-lg">HostelGo</span>
            </div>
            <p className="text-background/70 text-sm">
              © 2024 HostelGo. Academic Project - Frontend Demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
