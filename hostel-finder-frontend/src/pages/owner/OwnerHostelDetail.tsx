import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Shield, 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hostelApi, bookingApi, Hostel, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const OwnerHostelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== 'owner') {
      navigate("/");
      return;
    }
    if (id) {
      fetchHostelData();
    }
  }, [id, user, navigate]);

  const fetchHostelData = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 OwnerHostelDetail: Fetching hostel ID:", id);
      const [hostelData, bookingsData] = await Promise.all([
        hostelApi.getById(parseInt(id!)),
        bookingApi.getByHostel(parseInt(id!))
      ]);
      console.log("✅ OwnerHostelDetail: Received hostel data:", hostelData.name || hostelData.id);
      console.log("✅ OwnerHostelDetail: Received", bookingsData.length, "bookings");
      setHostel(hostelData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error: any) {
      console.error("❌ OwnerHostelDetail: Error fetching data:", error);
      toast({
        title: "Error loading hostel",
        description: error.message || "Failed to fetch hostel details",
        variant: "destructive",
      });
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        setTimeout(() => navigate("/owner/my-hostels"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: "confirmed" | "cancelled") => {
    setIsUpdatingBooking(bookingId);
    try {
      await bookingApi.update(bookingId, status);
      toast({
        title: status === 'confirmed' ? "Booking confirmed!" : "Booking cancelled",
        description: `The booking has been ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`,
      });
      // Refresh bookings
      const updatedBookings = await bookingApi.getByHostel(parseInt(id!));
      setBookings(updatedBookings);
    } catch (error: any) {
      toast({
        title: "Failed to update booking",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBooking(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="owner" title="Loading...">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hostel) {
    return (
      <DashboardLayout role="owner" title="Hostel Not Found">
        <div className="text-center py-16">
          <h2 className="font-heading text-2xl font-semibold mb-4">Hostel Not Found</h2>
          <Link to="/owner/my-hostels">
            <Button>Back to My Hostels</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <DashboardLayout role="owner" title={hostel.name} subtitle={hostel.city}>
      {/* Back Button */}
      <Link to="/owner/my-hostels" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to My Hostels
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hostel Info */}
          <Card>
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
              </div>
              
              {hostel.confirmed_bookings !== undefined && (
                <div className="mb-6 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">Currently Booked:</span>
                    <span className="font-semibold text-primary">{hostel.confirmed_bookings} student(s)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No bookings yet.</p>
              ) : (
                <div className="space-y-6">
                  {/* Pending Bookings */}
                  {pendingBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Pending ({pendingBookings.length})
                      </h3>
                      <div className="space-y-3">
                        {pendingBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border border-border rounded-lg bg-warning/5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{booking.student_name || 'Unknown Student'}</p>
                                <p className="text-sm text-muted-foreground">{booking.student_email}</p>
                                {booking.student_contact_number && (
                                  <p className="text-sm text-muted-foreground">Phone: {booking.student_contact_number}</p>
                                )}
                              </div>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                disabled={isUpdatingBooking === booking.id}
                              >
                                {isUpdatingBooking === booking.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                disabled={isUpdatingBooking === booking.id}
                              >
                                {isUpdatingBooking === booking.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Bookings */}
                  {confirmedBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Confirmed ({confirmedBookings.length})
                      </h3>
                      <div className="space-y-3">
                        {confirmedBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border border-border rounded-lg bg-green-500/5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{booking.student_name || 'Unknown Student'}</p>
                                <p className="text-sm text-muted-foreground">{booking.student_email}</p>
                                {booking.student_contact_number && (
                                  <p className="text-sm text-muted-foreground">Phone: {booking.student_contact_number}</p>
                                )}
                              </div>
                              <Badge className="bg-green-500 text-white">Confirmed</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              disabled={isUpdatingBooking === booking.id}
                            >
                              {isUpdatingBooking === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Cancel Booking
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancelled Bookings */}
                  {cancelledBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Cancelled ({cancelledBookings.length})
                      </h3>
                      <div className="space-y-3">
                        {cancelledBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border border-border rounded-lg bg-red-500/5 opacity-60">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{booking.student_name || 'Unknown Student'}</p>
                                <p className="text-sm text-muted-foreground">{booking.student_email}</p>
                              </div>
                              <Badge variant="destructive">Cancelled</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Bookings</dt>
                  <dd className="font-medium">{bookings.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pending</dt>
                  <dd className="font-medium text-yellow-500">{pendingBookings.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Confirmed</dt>
                  <dd className="font-medium text-green-500">{confirmedBookings.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cancelled</dt>
                  <dd className="font-medium text-red-500">{cancelledBookings.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Rent</dt>
                  <dd className="font-medium">Rs {hostel.rent.toLocaleString()}/month</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerHostelDetail;


