import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Building2, Star, MapPin, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HostelCard, { Hostel as HostelCardType } from "@/components/HostelCard";
import { hostelApi, Hostel as ApiHostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
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
    if (user.role !== "student") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data: ApiHostel[] = await hostelApi.getAll();
        const transformed: HostelCardType[] = data
          .filter((h) => h.is_verified === 1)
          .map((hostel) => ({
            id: hostel.id.toString(),
            name: hostel.name,
            city: hostel.city,
            address: hostel.address,
            rent: hostel.rent,
            rating: 4.5, // default rating until backend supports it
            facilities: hostel.facilities.split(",").map((f) => f.trim()).filter(Boolean),
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            isVerified: hostel.is_verified === 1,
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

    fetchData();
  }, [user, isAuthLoading, navigate, toast]);

  const verifiedHostels = hostels;
  const topRatedHostels = [...verifiedHostels].slice(0, 3);

  const uniqueCities = new Set(verifiedHostels.map((h) => h.city));

  const stats = [
    { icon: Building2, label: "Available Hostels", value: verifiedHostels.length },
    { icon: MapPin, label: "Cities Covered", value: uniqueCities.size },
    { icon: Star, label: "Average Rating", value: "4.5" },
    { icon: TrendingUp, label: "New This Month", value: "-" },
  ];

  return (
    <DashboardLayout role="student" title="Student Dashboard" subtitle="Find your perfect hostel accommodation">
      {/* Quick Actions */}
      <div className="mb-8">
        <Link to="/student/hostels">
          <Button size="lg" className="gap-2">
            <Search className="h-5 w-5" />
            Search Hostels
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

      {/* Info Card */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Only Verified Hostels</h3>
              <p className="text-sm text-muted-foreground">
                As a student, you can only view hostels that have been verified by our admin team. 
                This ensures authenticity and safety of all listed accommodations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Rated Hostels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Top Rated Hostels</CardTitle>
          <Link to="/student/hostels">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading || isAuthLoading ? (
            <p className="text-sm text-muted-foreground">Loading hostels...</p>
          ) : verifiedHostels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified hostels available yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedHostels.map((hostel) => (
                <HostelCard key={hostel.id} hostel={hostel} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
