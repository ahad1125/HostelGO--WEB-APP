import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Calendar, Building2, MapPin, Loader2, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enquiryApi, Enquiry } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StudentEnquiries = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
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

    fetchEnquiries();
  }, [user, isAuthLoading, navigate]);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await enquiryApi.getByStudent();
      setEnquiries(data);
    } catch (error: any) {
      toast({
        title: "Error loading enquiries",
        description: error.message || "Failed to fetch enquiries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingEnquiries = enquiries.filter(e => e.status === 'pending').length;
  const respondedEnquiries = enquiries.filter(e => e.status === 'responded').length;

  if (isLoading || isAuthLoading) {
    return (
      <DashboardLayout role="student" title="My Enquiries" subtitle="View your enquiries and responses">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading enquiries...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Enquiries" subtitle="View your enquiries and responses">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enquiries.length}</p>
                <p className="text-sm text-muted-foreground">Total Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingEnquiries}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{respondedEnquiries}</p>
                <p className="text-sm text-muted-foreground">Responded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiries List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">My Enquiries</CardTitle>
          {pendingEnquiries > 0 && (
            <Badge variant="destructive">{pendingEnquiries} Awaiting Response</Badge>
          )}
        </CardHeader>
        <CardContent>
          {enquiries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">No Enquiries Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't sent any enquiries yet.</p>
              <Link to="/student/hostels">
                <button className="text-primary hover:underline">Browse Hostels</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <Card key={enquiry.id} className={`border-l-4 ${enquiry.status === 'responded' ? 'border-l-accent' : 'border-l-warning'}`}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        {enquiry.type === 'schedule_visit' ? (
                          <Calendar className="h-5 w-5 text-primary" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary" />
                        )}
                        <Badge variant={enquiry.type === 'schedule_visit' ? 'default' : 'secondary'}>
                          {enquiry.type === 'schedule_visit' ? 'Scheduled Visit' : 'General Enquiry'}
                        </Badge>
                        <Badge variant={enquiry.status === 'pending' ? 'destructive' : 'outline'}>
                          {enquiry.status === 'pending' ? 'Pending' : 'Responded'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <Link to={`/student/hostel/${enquiry.hostel_id}`} className="font-medium hover:text-primary">
                            {enquiry.hostel_name}
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{enquiry.hostel_address}, {enquiry.hostel_city}</span>
                        </div>

                        {enquiry.type === 'schedule_visit' && enquiry.scheduled_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Scheduled: <span className="font-medium">{formatDate(enquiry.scheduled_date)}</span>
                            </span>
                          </div>
                        )}

                        {enquiry.message && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Your Message:</p>
                            <p className="text-sm text-foreground">{enquiry.message}</p>
                          </div>
                        )}

                        {enquiry.reply && (
                          <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                            <p className="text-sm font-medium mb-1">Owner's Reply:</p>
                            <p className="text-sm text-foreground">{enquiry.reply}</p>
                            <div className="text-xs text-muted-foreground mt-2">
                              Replied: {formatDate(enquiry.replied_at)}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-2">
                          Sent: {formatDate(enquiry.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentEnquiries;







