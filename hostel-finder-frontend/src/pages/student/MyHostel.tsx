import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Star, 
  Shield, 
  User, 
  Calendar,
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookingApi, hostelApi, Booking, Hostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getHostelImage } from "@/utils/hostelImages";

const MyHostel = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      navigate("/");
      return;
    }

    fetchMyHostel();
  }, [user, isAuthLoading, navigate]);

  const fetchMyHostel = async () => {
    setIsLoading(true);
    try {
      // Get all bookings for the student
      const bookings = await bookingApi.getByStudent();
      
      // Find confirmed booking (student's current hostel)
      const confirmedBooking = bookings.find(
        b => b.status === 'confirmed'
      );
      
      if (confirmedBooking) {
        setBooking(confirmedBooking);
        // Fetch hostel details
        try {
          const hostelData = await hostelApi.getById(confirmedBooking.hostel_id);
          setHostel(hostelData);
        } catch (error: any) {
          console.error("Error fetching hostel details:", error);
          toast({
            title: "Error loading hostel details",
            description: error.message || "Failed to fetch hostel information",
            variant: "destructive",
          });
        }
      } else {
        setBooking(null);
        setHostel(null);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to fetch your hostel information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <DashboardLayout role="student" title="My Hostel" subtitle="Your current hostel accommodation">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking || !hostel) {
    return (
      <DashboardLayout role="student" title="My Hostel" subtitle="Your current hostel accommodation">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold mb-2">No Hostel Assigned</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have a confirmed hostel booking yet. Browse hostels and book one to see it here.
                </p>
                <Link to="/student/hostels">
                  <Button className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Browse Hostels
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const facilities = hostel.facilities ? hostel.facilities.split(',').map(f => f.trim()).filter(Boolean) : [];

  return (
    <DashboardLayout role="student" title="My Hostel" subtitle="Your current hostel accommodation">
      {/* Back Button */}
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hostel Image */}
          <Card>
            <div className="relative h-80 overflow-hidden rounded-t-lg">
              <img
                src={getHostelImage(hostel.id, hostel.image_url)}
                alt={hostel.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80`;
                  target.onerror = null;
                }}
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Confirmed
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl mb-2">{hostel.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{hostel.address}, {hostel.city}</span>
                  </div>
                </div>
                {hostel.is_verified === 1 && (
                  <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">Rs {hostel.rent.toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-warning/20 rounded-lg">
                  <Star className="h-5 w-5 fill-current text-yellow-500" />
                  <span className="font-semibold">4.5</span>
                </div>
              </div>

              <h3 className="font-heading font-semibold text-lg mb-4">Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {facilities.length > 0 ? (
                  facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-medium">{facility}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No facilities listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Booking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking Status
                  </dt>
                  <dd>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  </dd>
                </div>
                {booking.created_at && (
                  <div className="flex justify-between items-center">
                    <dt className="text-muted-foreground">Booking Date</dt>
                    <dd className="font-medium">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground">Monthly Rent</dt>
                  <dd className="font-medium text-lg">Rs {hostel.rent.toLocaleString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {hostel.owner_name && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd className="font-medium">{hostel.owner_name}</dd>
                  </div>
                )}
                {hostel.owner_email && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Contact Email</dt>
                    <dd className="font-medium text-xs break-all">{hostel.owner_email}</dd>
                  </div>
                )}
                {hostel.owner_contact_number && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Contact Number</dt>
                    <dd className="font-medium">{hostel.owner_contact_number}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">City</dt>
                  <dd className="font-medium">{hostel.city}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Security Deposit</dt>
                  <dd className="font-medium">Rs {(hostel.rent * 2).toLocaleString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/student/hostel/${hostel.id}`} className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Building2 className="h-4 w-4" />
                  View Full Details
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  if (hostel.owner_email) {
                    const subject = encodeURIComponent(`Inquiry about ${hostel.name}`);
                    const body = encodeURIComponent(`Hello,\n\nI am a current resident at ${hostel.name} and would like to get in touch.\n\nThank you!`);
                    window.location.href = `mailto:${hostel.owner_email}?subject=${subject}&body=${body}`;
                  } else {
                    toast({
                      title: "Contact unavailable",
                      description: "Owner email information is not available",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <User className="h-4 w-4" />
                Contact Owner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyHostel;

