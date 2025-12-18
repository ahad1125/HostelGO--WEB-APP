import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Building2, CheckCircle, Clock, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HostelCard, { Hostel as HostelCardType } from "@/components/HostelCard";
import { hostelApi, Hostel as ApiHostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const OwnerDashboard = () => {
  const [hostels, setHostels] = useState<HostelCardType[]>([]);
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
    if (user.role !== "owner") {
      navigate("/");
      return;
    }

    const fetchHostels = async () => {
      setIsLoading(true);
      try {
        const data: ApiHostel[] = await hostelApi.getAll();
        const transformed: HostelCardType[] = data.map((hostel) => ({
          id: hostel.id.toString(),
          name: hostel.name,
          city: hostel.city,
          address: hostel.address,
          rent: hostel.rent,
          rating: 4.5,
          facilities: hostel.facilities.split(",").map((f) => f.trim()).filter(Boolean),
          image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
          isVerified: hostel.is_verified === 1,
          ownerId: hostel.owner_id.toString(),
        }));
        setHostels(transformed);
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

    fetchHostels();
  }, [user, isAuthLoading, navigate, toast]);

  const myHostels = hostels;
  const verifiedCount = myHostels.filter((h) => h.isVerified).length;
  const pendingCount = myHostels.filter((h) => !h.isVerified).length;

  const stats = [
    { icon: Building2, label: "Total Listings", value: myHostels.length },
    { icon: CheckCircle, label: "Verified", value: verifiedCount },
    { icon: Clock, label: "Pending Verification", value: pendingCount },
    { icon: TrendingUp, label: "Total Views", value: "—" },
  ];

  return (
    <DashboardLayout role="owner" title="Owner Dashboard" subtitle="Manage your hostel listings">
      {/* Quick Actions */}
      <div className="mb-8">
        <Link to="/owner/add-hostel">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Hostel
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Verification Status</h3>
                <p className="text-sm text-muted-foreground">
                  Your verified hostels are visible to students. Pending hostels are under admin review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Performance Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Add high-quality photos and complete facility details to attract more students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Hostels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">My Hostels</CardTitle>
          <Link to="/owner/my-hostels">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading || isAuthLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading your hostels...
            </div>
          ) : myHostels.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHostels.slice(0, 3).map((hostel) => (
                <HostelCard 
                  key={hostel.id} 
                  hostel={hostel} 
                  showVerificationBadge 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">No Hostels Listed</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first hostel property.</p>
              <Link to="/owner/add-hostel">
                <Button>Add Hostel</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
