import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import HostelCard, { Hostel as HostelCardType } from "@/components/HostelCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { adminApi, Hostel as ApiHostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminHostels = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hostels, setHostels] = useState<ApiHostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    fetchHostels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthLoading]);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllHostels();
      setHostels(data);
    } catch (error: any) {
      toast({
        title: "Failed to load hostels",
        description: error.message || "Could not fetch hostels from server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transformHostel = (hostel: ApiHostel): HostelCardType => ({
    id: hostel.id.toString(),
    name: hostel.name,
    city: hostel.city,
    address: hostel.address,
    rent: hostel.rent,
    rating: 4.5, // Backend doesn't store rating yet
    facilities: hostel.facilities.split(",").map((f) => f.trim()).filter(Boolean),
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    isVerified: hostel.is_verified === 1,
    ownerId: hostel.owner_id.toString(),
  });

  const allHostels: HostelCardType[] = hostels.map(transformHostel);

  const verifiedHostels = allHostels.filter((h) => h.isVerified);
  const unverifiedHostels = allHostels.filter((h) => !h.isVerified);

  const filterBySearch = (hostelsToFilter: typeof allHostels) => {
    if (!searchTerm) return hostelsToFilter;
    const term = searchTerm.toLowerCase();
    return hostelsToFilter.filter((h) => 
      h.name.toLowerCase().includes(term) ||
      h.city.toLowerCase().includes(term) ||
      h.address.toLowerCase().includes(term)
    );
  };

  const handleVerify = async (id: string) => {
    try {
      await adminApi.verifyHostel(Number(id));
      toast({
        title: "Hostel verified",
        description: "The hostel has been marked as verified.",
      });
      fetchHostels();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify hostel",
        variant: "destructive",
      });
    }
  };

  const handleUnverify = async (id: string) => {
    try {
      await adminApi.unverifyHostel(Number(id));
      toast({
        title: "Hostel unverified",
        description: "The hostel has been marked as unverified.",
      });
      fetchHostels();
    } catch (error: any) {
      toast({
        title: "Unverification failed",
        description: error.message || "Could not unverify hostel",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="admin" title="All Hostels" subtitle="View and manage all hostel listings">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          Total: {allHostels.length}
        </Badge>
        <Badge className="bg-accent text-accent-foreground text-sm py-1 px-3">
          Verified: {verifiedHostels.length}
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3">
          Unverified: {unverifiedHostels.length}
        </Badge>
      </div>

      {isLoading || isAuthLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Hostels</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="unverified">Unverified</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBySearch(allHostels).map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={hostel}
                    showActions
                    showVerificationBadge
                    onVerify={!hostel.isVerified ? handleVerify : undefined}
                    onUnverify={hostel.isVerified ? handleUnverify : undefined}
                  />
                ))}
              </div>
              {filterBySearch(allHostels).length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">No hostels found matching your search.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="verified">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBySearch(verifiedHostels).map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={hostel}
                    showActions
                    showVerificationBadge
                    onUnverify={handleUnverify}
                  />
                ))}
              </div>
              {filterBySearch(verifiedHostels).length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">No verified hostels found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unverified">
              <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm">
                  <strong>Admin Action Required:</strong> Review and verify these hostel submissions. 
                  Only verified hostels are visible to students.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBySearch(unverifiedHostels).map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={hostel}
                    showActions
                    showVerificationBadge
                    onVerify={handleVerify}
                  />
                ))}
              </div>
              {filterBySearch(unverifiedHostels).length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">No unverified hostels. All listings are verified!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminHostels;
