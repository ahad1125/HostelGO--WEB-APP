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
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { hostelApi, reviewApi, Hostel, Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

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
      const [hostelData, reviewsData] = await Promise.all([
        hostelApi.getById(parseInt(id!)),
        reviewApi.getByHostel(parseInt(id!))
      ]);
      setHostel(hostelData);
      setReviews(reviewsData);
    } catch (error: any) {
      toast({
        title: "Error loading hostel",
        description: error.message || "Failed to fetch hostel details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    try {
      await reviewApi.create(parseInt(id!), reviewForm.rating, reviewForm.comment);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      });
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
      // Refresh reviews
      const updatedReviews = await reviewApi.getByHostel(parseInt(id!));
      setReviews(updatedReviews);
    } catch (error: any) {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
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

  const facilities = hostel.facilities.split(', ');

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
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
              alt={hostel.name}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Hostel Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl mb-2">{hostel.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
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
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              </div>

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
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? "Cancel" : "Write Review"}
              </Button>
            </CardHeader>
            <CardContent>
              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-4">Write Your Review</h4>
                  
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
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Contact Hostel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full gap-2">
                <Phone className="h-4 w-4" />
                Call Now
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Send Inquiry
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Visit
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
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
    </DashboardLayout>
  );
};

export default HostelDetail;
