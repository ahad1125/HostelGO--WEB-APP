import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { adminApi, bookingApi, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookingWithDetails extends Booking {
  hostel_name?: string;
  hostel_address?: string;
  hostel_city?: string;
  hostel_rent?: number;
  student_name?: string;
  student_email?: string;
  student_contact_number?: string;
  owner_name?: string;
  owner_email?: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchBookings();
  }, [user, isAuthLoading, navigate]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllBookings();
      setBookings(data);
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message || "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await bookingApi.update(bookingId, 'confirmed');
      toast({
        title: "Booking confirmed!",
        description: "The booking has been successfully confirmed",
      });
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Failed to confirm booking",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (bookingId: number, studentName?: string, hostelName?: string) => {
    if (!confirm(`Are you sure you want to cancel the booking for ${studentName || 'this student'} at ${hostelName || 'this hostel'}?`)) {
      return;
    }

    try {
      await bookingApi.update(bookingId, 'cancelled');
      toast({
        title: "Booking cancelled!",
        description: "The booking has been successfully cancelled",
      });
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Failed to cancel booking",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Group bookings by hostel
  const bookingsByHostel = bookings.reduce((acc, booking) => {
    const hostelId = booking.hostel_id;
    if (!acc[hostelId]) {
      acc[hostelId] = {
        hostel_id: hostelId,
        hostel_name: booking.hostel_name || "Unknown Hostel",
        hostel_address: booking.hostel_address || "",
        hostel_city: booking.hostel_city || "",
        hostel_rent: booking.hostel_rent || 0,
        owner_name: booking.owner_name || "",
        bookings: []
      };
    }
    acc[hostelId].bookings.push(booking);
    return acc;
  }, {} as Record<number, {
    hostel_id: number;
    hostel_name: string;
    hostel_address: string;
    hostel_city: string;
    hostel_rent: number;
    owner_name: string;
    bookings: BookingWithDetails[];
  }>);

  const filteredBookings = Object.values(bookingsByHostel).filter(hostelGroup => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      hostelGroup.hostel_name.toLowerCase().includes(term) ||
      hostelGroup.hostel_city.toLowerCase().includes(term) ||
      hostelGroup.bookings.some(b => 
        b.student_name?.toLowerCase().includes(term) ||
        b.student_email?.toLowerCase().includes(term)
      )
    );
  });

  const allBookings = bookings;
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
  const ownerApprovedBookings = allBookings.filter(b => b.status === 'owner_approved');
  const pendingBookings = allBookings.filter(b => b.status === 'pending');
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'owner_approved':
        return <Badge className="bg-blue-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Owner Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Bookings">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="admin" 
      title="Student Bookings" 
      subtitle="View all student enrollments across hostels"
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            placeholder="Search by hostel name, city, or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allBookings.length}</p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cancelledBookings.length}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({allBookings.length})</TabsTrigger>
          <TabsTrigger value="owner_approved">Awaiting Admin ({ownerApprovedBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Owner ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="by-hostel">By Hostel ({Object.keys(bookingsByHostel).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {allBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No bookings found.</p>
                </CardContent>
              </Card>
            ) : (
              allBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{booking.hostel_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.hostel_address}, {booking.hostel_city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.student_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.student_email}</span>
                          </div>
                          {booking.student_contact_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.student_contact_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                    {/* Admin can cancel any active booking */}
                    {booking.status !== 'cancelled' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleCancelBooking(booking.id, booking.student_name, booking.hostel_name)}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="owner_approved">
          <div className="space-y-4">
            {ownerApprovedBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No bookings awaiting admin approval.</p>
                </CardContent>
              </Card>
            ) : (
              ownerApprovedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{booking.hostel_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.hostel_address}, {booking.hostel_city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.student_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.student_email}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleConfirmBooking(booking.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirm Booking
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => handleCancelBooking(booking.id, booking.student_name, booking.hostel_name)}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="confirmed">
          <div className="space-y-4">
            {confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No confirmed bookings.</p>
                </CardContent>
              </Card>
            ) : (
              confirmedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{booking.hostel_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.hostel_address}, {booking.hostel_city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.student_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.student_email}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    {/* Show cancel button for confirmed bookings - admin can cancel any active booking */}
                    {booking.status === 'confirmed' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleCancelBooking(booking.id, booking.student_name, booking.hostel_name)}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No pending bookings.</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{booking.hostel_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.hostel_address}, {booking.hostel_city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.student_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.student_email}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    {/* Admin can cancel pending bookings */}
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleCancelBooking(booking.id, booking.student_name, booking.hostel_name)}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="by-hostel">
          <div className="space-y-6">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No bookings found.</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((hostelGroup) => (
                <Card key={hostelGroup.hostel_id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg mb-2">
                          {hostelGroup.hostel_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{hostelGroup.hostel_address}, {hostelGroup.hostel_city}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Owner: {hostelGroup.owner_name}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {hostelGroup.bookings.length} student{hostelGroup.bookings.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hostelGroup.bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="p-4 border border-border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.student_name || "Unknown Student"}</span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{booking.student_email}</span>
                            </div>
                            {booking.student_contact_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{booking.student_contact_number}</span>
                              </div>
                            )}
                          </div>
                          {/* Admin can cancel bookings from this view too */}
                          {booking.status !== 'cancelled' && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                                onClick={() => handleCancelBooking(booking.id, booking.student_name, hostelGroup.hostel_name)}
                              >
                                <XCircle className="h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminBookings;





