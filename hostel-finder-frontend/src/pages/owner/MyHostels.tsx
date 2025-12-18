import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import HostelCard from "@/components/HostelCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hostelApi, Hostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MyHostels = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchHostels();
  }, [user, navigate]);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const data = await hostelApi.getAll();
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

  const verifiedHostels = hostels.filter(h => h.is_verified === 1);
  const pendingHostels = hostels.filter(h => h.is_verified === 0);

  // Transform API hostel to HostelCard format
  const transformHostel = (hostel: Hostel) => ({
    id: hostel.id.toString(),
    name: hostel.name,
    address: hostel.address,
    city: hostel.city,
    rent: hostel.rent,
    facilities: hostel.facilities.split(', '),
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    isVerified: hostel.is_verified === 1,
  });

  const handleEdit = (id: string) => {
    navigate(`/owner/edit-hostel/${id}`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await hostelApi.delete(parseInt(deleteId));
      toast({
        title: "Hostel deleted",
        description: "Your hostel has been removed",
      });
      setDeleteId(null);
      fetchHostels(); // Refresh list
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="owner" title="My Hostels" subtitle="View and manage your hostel listings">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading hostels...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="owner" title="My Hostels" subtitle="View and manage your hostel listings">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total: {hostels.length} hostel(s)</span>
        </div>
        <Link to="/owner/add-hostel">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Hostel
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({hostels.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedHostels.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingHostels.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {hostels.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostels.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  hostel={transformHostel(hostel)}
                  showActions
                  showVerificationBadge
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="verified">
          {verifiedHostels.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedHostels.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  hostel={transformHostel(hostel)}
                  showActions
                  showVerificationBadge
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No verified hostels yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingHostels.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Pending hostels are under review by our admin team. 
                  They will be visible to students once verified.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingHostels.map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={transformHostel(hostel)}
                    showActions
                    showVerificationBadge
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No pending hostels. All your listings are verified!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hostel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hostel? This action cannot be undone.
              All associated data including reviews will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

const EmptyState = () => (
  <div className="text-center py-16 bg-card border border-border rounded-lg">
    <div className="max-w-md mx-auto">
      <h3 className="font-heading text-xl font-semibold mb-2">No Hostels Listed</h3>
      <p className="text-muted-foreground mb-6">
        You haven't added any hostel properties yet. Start by adding your first hostel.
      </p>
      <Link to="/owner/add-hostel">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Hostel
        </Button>
      </Link>
    </div>
  </div>
);

export default MyHostels;
