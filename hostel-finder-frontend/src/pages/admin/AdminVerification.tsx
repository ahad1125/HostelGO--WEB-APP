import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Eye, Clock, MapPin, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, Hostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminVerification = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

    fetchHostels();
  }, [user, isAuthLoading, navigate]);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllHostels();
      setHostels(data);
    } catch (error: any) {
      toast({
        title: "Error loading hostels",
        description: error.message || "Failed to fetch hostels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingHostels = hostels.filter(h => h.is_verified === 0);

  const handleVerify = async (id: number) => {
    setIsProcessing(true);
    try {
      await adminApi.verifyHostel(id);
      toast({
        title: "Hostel verified!",
        description: "The hostel is now visible to students",
      });
      setSelectedHostel(null);
      fetchHostels();
    } catch (error: any) {
      toast({
        title: "Failed to verify",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedHostel) return;
    
    setIsProcessing(true);
    try {
      await adminApi.unverifyHostel(selectedHostel.id);
      toast({
        title: "Hostel rejected",
        description: "The owner has been notified",
      });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedHostel(null);
      fetchHostels();
    } catch (error: any) {
      toast({
        title: "Failed to reject",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <DashboardLayout role="admin" title="Hostel Verification" subtitle="Review and verify hostel submissions">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading hostels...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Hostel Verification" subtitle="Review and verify hostel submissions">
      {/* Stats */}
      <div className="flex gap-4 mb-8">
        <Card className="flex-1">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingHostels.length}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingHostels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no hostels pending verification at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingHostels.map((hostel) => (
            <Card key={hostel.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
                    alt={hostel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-lg">{hostel.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{hostel.address}, {hostel.city}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Rs {hostel.rent.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hostel.facilities.split(', ').slice(0, 5).map((facility) => (
                          <Badge key={facility} variant="secondary" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                        {hostel.facilities.split(', ').length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hostel.facilities.split(', ').length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 lg:flex-none gap-2"
                        onClick={() => setSelectedHostel(hostel)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 lg:flex-none gap-2 bg-accent hover:bg-accent/90"
                        onClick={() => handleVerify(hostel.id)}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 lg:flex-none gap-2"
                        onClick={() => {
                          setSelectedHostel(hostel);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedHostel && !showRejectDialog} onOpenChange={() => setSelectedHostel(null)}>
        <DialogContent className="max-w-2xl">
          {selectedHostel && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">{selectedHostel.name}</DialogTitle>
                <DialogDescription>
                  Review hostel details before verification
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
                  alt={selectedHostel.name}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedHostel.address}, {selectedHostel.city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">Rs {selectedHostel.rent.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHostel.facilities.split(', ').map((facility) => (
                        <Badge key={facility} variant="secondary">{facility}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedHostel(null)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => handleVerify(selectedHostel.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Hostel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Hostel</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this hostel submission. 
              The owner will be notified with this feedback.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Verification Guidelines</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Verify that hostel images are genuine and recent</li>
          <li>• Confirm the address and location details are accurate</li>
          <li>• Check that listed facilities match the actual offerings</li>
          <li>• Ensure pricing is reasonable and matches market rates</li>
          <li>• Verify owner contact information is valid</li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default AdminVerification;
