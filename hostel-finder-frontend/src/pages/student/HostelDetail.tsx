import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Shield, 
  Phone, 
  Mail, 
  Calendar,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Droplets,
  Zap,
  BookOpen,
  Loader2,
  Edit,
  Trash2,
  User
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { hostelApi, reviewApi, enquiryApi, bookingApi, Hostel, Review, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getHostelImage } from "@/utils/hostelImages";

const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  ac: <Droplets className="h-5 w-5" />,
  food: <Utensils className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  gym: <Dumbbell className="h-5 w-5" />,
  "power backup": <Zap className="h-5 w-5" />,
  "study room": <BookOpen className="h-5 w-5" />,
  library: <BookOpen className="h-5 w-5" />,
};

const HostelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (id) {
      fetchHostelData();
    }
  }, [id, user, navigate]);

  const fetchHostelData = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 HostelDetail: Fetching hostel ID:", id);
      
      // Check if user is logged in before making authenticated requests
      const storedUser = localStorage.getItem('hostelgo_user');
      if (!storedUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to view hostel details",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      const [hostelData, reviewsData] = await Promise.all([
        hostelApi.getById(parseInt(id!)),
        reviewApi.getByHostel(parseInt(id!))
      ]);
      console.log("✅ HostelDetail: Received hostel data:", hostelData.name || hostelData.id);
      console.log("✅ HostelDetail: Received", reviewsData.length, "reviews");
      setHostel(hostelData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Check if student has existing booking for this hostel
      if (user && user.role === 'student') {
        try {
          const bookings = await bookingApi.getByStudent();
          const booking = bookings.find(b => b.hostel_id === parseInt(id!) && (b.status === 'pending' || b.status === 'owner_approved' || b.status === 'confirmed'));
          setExistingBooking(booking || null);
        } catch (err) {
          console.log("No existing booking found");
        }
      }
    } catch (error: any) {
      console.error("❌ HostelDetail: Error fetching data:", error);
      
      // Handle authentication errors
      if (error.message?.includes('401') || error.message?.includes('Authentication') || error.message?.includes('credentials')) {
        toast({
          title: "Authentication required",
          description: "Please log in to view hostel details",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      // Don't show error toast if user is being redirected to login
      if (!error.message?.includes('401') && !error.message?.includes('Authentication')) {
        toast({
          title: "Error loading hostel",
          description: error.message || "Failed to fetch hostel details",
          variant: "destructive",
        });
      }
      // Navigate back if hostel not found
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        setTimeout(() => navigate("/student/hostels"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    try {
      if (editingReview) {
        await reviewApi.update(editingReview.id, reviewForm.rating, reviewForm.comment);
        toast({
          title: "Review updated!",
          description: "Your review has been updated",
        });
        setEditingReview(null);
      } else {
        await reviewApi.create(parseInt(id!), reviewForm.rating, reviewForm.comment);
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback",
        });
      }
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
      // Refresh reviews
      const updatedReviews = await reviewApi.getByHostel(parseInt(id!));
      setReviews(updatedReviews);
    } catch (error: any) {
      toast({
        title: editingReview ? "Failed to update review" : "Failed to submit review",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await reviewApi.delete(reviewId);
      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });
      // Refresh reviews
      const updatedReviews = await reviewApi.getByHostel(parseInt(id!));
      setReviews(updatedReviews);
    } catch (error: any) {
      toast({
        title: "Failed to delete review",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCallNow = () => {
    // Simplified: Always send email instead of calling
    if (hostel?.owner_email) {
      const subject = encodeURIComponent(`Inquiry about ${hostel.name}`);
      const body = encodeURIComponent(`Hello,\n\nI am interested in learning more about ${hostel.name} located at ${hostel.address}, ${hostel.city}.\n\nPlease contact me at your earliest convenience.\n\nThank you!`);
      window.location.href = `mailto:${hostel.owner_email}?subject=${subject}&body=${body}`;
      toast({
        title: "Opening email",
        description: `Email client will open to contact ${hostel.owner_email}`,
      });
    } else {
      toast({
        title: "Contact unavailable",
        description: "Owner email information is not available",
        variant: "destructive",
      });
    }
  };

  const handleSendEnquiry = async () => {
    if (!user || user.role !== 'student') {
      toast({
        title: "Authentication required",
        description: "Please log in as a student to send enquiries",
        variant: "destructive",
      });
      return;
    }

    if (!enquiryMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your enquiry message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingEnquiry(true);
    try {
      await enquiryApi.create(parseInt(id!), 'enquiry', enquiryMessage);
      toast({
        title: "Enquiry sent!",
        description: "The hostel owner will be notified",
      });
      setShowEnquiryDialog(false);
      setEnquiryMessage("");
    } catch (error: any) {
      console.error('Enquiry error:', error);
      toast({
        title: "Failed to send enquiry",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!user || user.role !== 'student') {
      toast({
        title: "Authentication required",
        description: "Please log in as a student to schedule visits",
        variant: "destructive",
      });
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Date and time required",
        description: "Please select both date and time for your visit",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = `${scheduleDate}T${scheduleTime}:00`;
    setIsSubmittingEnquiry(true);
    try {
      await enquiryApi.create(parseInt(id!), 'schedule_visit', `Scheduled visit on ${scheduleDate} at ${scheduleTime}`, scheduledDateTime);
      toast({
        title: "Visit scheduled!",
        description: "The hostel owner will be notified of your visit",
      });
      setShowScheduleDialog(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error: any) {
      console.error('Schedule visit error:', error);
      toast({
        title: "Failed to schedule visit",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleBookHostel = async () => {
    if (!user || user.role !== 'student') {
      toast({
        title: "Authentication required",
        description: "Please log in as a student to book hostels",
        variant: "destructive",
      });
      return;
    }

    if (!hostel || hostel.is_verified !== 1) {
      toast({
        title: "Cannot book",
        description: "Only verified hostels can be booked",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const result = await bookingApi.create(parseInt(id!));
      setExistingBooking(result.booking);
      toast({
        title: "Booking created!",
        description: "Your booking is pending owner approval",
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Failed to book hostel",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" title="Loading...">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hostel) {
    return (
      <DashboardLayout role="student" title="Hostel Not Found">
        <div className="text-center py-16">
          <h2 className="font-heading text-2xl font-semibold mb-4">Hostel Not Found</h2>
          <Link to="/student/hostels">
            <Button>Back to Hostels</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const facilities = hostel.facilities ? hostel.facilities.split(', ').filter(Boolean) : [];

  return (
    <DashboardLayout role="student" title={hostel.name} subtitle={hostel.city}>
      {/* Back Button */}
      <Link to="/student/hostels" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Hostels
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="rounded-xl overflow-hidden border border-border bg-muted">
            <img
              src={getHostelImage(hostel.id, hostel.image_url)}
              alt={hostel.name}
              className="w-full h-80 object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80`;
                target.onerror = null; // Prevent infinite loop
              }}
            />
          </div>

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
                  {hostel.owner_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Owner: <span className="font-medium text-foreground">{hostel.owner_name}</span></span>
                    </div>
                  )}
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
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
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

              <h3 className="font-heading font-semibold text-lg mb-4">Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {facilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-primary">
                      {facilityIcons[facility.toLowerCase()] || <Star className="h-5 w-5" />}
                    </div>
                    <span className="font-medium">{facility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading">Student Reviews</CardTitle>
              {!showReviewForm && user && user.role === 'student' && (
                <Button onClick={() => {
                  setEditingReview(null);
                  setReviewForm({ rating: 5, comment: "" });
                  setShowReviewForm(true);
                }}>
                  Write Review
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {/* Review Form */}
              {showReviewForm && user && user.role === 'student' && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{editingReview ? "Edit Your Review" : "Write Your Review"}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                        setReviewForm({ rating: 5, comment: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <Label className="mb-2 block">Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`h-8 w-8 ${star <= reviewForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="comment" className="mb-2 block">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience staying at this hostel..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmittingReview}>
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {review.student_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{review.student_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {user && review.student_id === user.id && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card - Only visible for students */}
          {user && user.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Contact Hostel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              {existingBooking ? (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Booking Status:</span>
                    <Badge 
                      variant={
                        existingBooking.status === 'confirmed' ? 'default' 
                        : existingBooking.status === 'owner_approved' ? 'default'
                        : existingBooking.status === 'pending' ? 'secondary' 
                        : 'destructive'
                      }
                    >
                      {existingBooking.status.charAt(0).toUpperCase() + existingBooking.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {existingBooking.status === 'pending' 
                      ? "Waiting for owner approval"
                      : existingBooking.status === 'owner_approved'
                      ? "Owner approved! Waiting for admin confirmation"
                      : existingBooking.status === 'confirmed'
                      ? "Your booking is confirmed!"
                      : "This booking has been cancelled"}
                  </p>
                  {(existingBooking.status === 'pending' || existingBooking.status === 'owner_approved') && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={async () => {
                        try {
                          await bookingApi.update(existingBooking.id, 'cancelled');
                          setExistingBooking(null);
                          toast({
                            title: "Booking cancelled",
                            description: "Your booking has been cancelled",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Failed to cancel",
                            description: error.message || "Please try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full gap-2 bg-primary hover:bg-primary/90" 
                  onClick={handleBookHostel}
                  disabled={isBooking || !hostel || hostel.is_verified !== 1}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Book This Hostel
                    </>
                  )}
                </Button>
              )}
              <Button className="w-full gap-2" onClick={handleCallNow}>
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setShowEnquiryDialog(true)}
              >
                <Mail className="h-4 w-4" />
                Send Inquiry
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Calendar className="h-4 w-4" />
                Schedule Visit
              </Button>
            </CardContent>
          </Card>
          )}

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
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium">Paying Guest</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Gender</dt>
                  <dd className="font-medium">Co-ed</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Room Types</dt>
                  <dd className="font-medium">Single, Double, Triple</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Security Deposit</dt>
                  <dd className="font-medium">Rs {(hostel.rent * 2).toLocaleString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enquiry Dialog */}
      <Dialog open={showEnquiryDialog} onOpenChange={setShowEnquiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Enquiry</DialogTitle>
            <DialogDescription>
              Send a message to the hostel owner about this property
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="enquiry-message">Your Message</Label>
              <Textarea
                id="enquiry-message"
                placeholder="Ask about availability, facilities, or any other questions..."
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEnquiryDialog(false);
              setEnquiryMessage("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleSendEnquiry} disabled={isSubmittingEnquiry || !enquiryMessage.trim()}>
              {isSubmittingEnquiry ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Enquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
            <DialogDescription>
              Schedule a time to visit this hostel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="visit-date">Date</Label>
              <Input
                id="visit-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="visit-time">Time</Label>
              <Input
                id="visit-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-2"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowScheduleDialog(false);
              setScheduleDate("");
              setScheduleTime("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleScheduleVisit} disabled={isSubmittingEnquiry || !scheduleDate || !scheduleTime}>
              {isSubmittingEnquiry ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Visit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HostelDetail;
