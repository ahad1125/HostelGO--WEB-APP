import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, Clock, Users, TrendingUp, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, Hostel as ApiHostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
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

    fetchHostels();
  }, [user, isAuthLoading, navigate, toast]);

  const allHostels = hostels;
  const verifiedCount = allHostels.filter((h) => h.is_verified === 1).length;
  const pendingCount = allHostels.filter((h) => h.is_verified === 0).length;
  const uniqueCities = new Set(allHostels.map((h) => h.city));

  const stats = [
    { icon: Building2, label: "Total Hostels", value: allHostels.length, color: "text-primary" },
    { icon: CheckCircle, label: "Verified", value: verifiedCount, color: "text-accent" },
    { icon: Clock, label: "Pending Review", value: pendingCount, color: "text-yellow-500" },
    { icon: Users, label: "Cities Covered", value: uniqueCities.size, color: "text-primary" },
  ];

  const recentActivities = allHostels.slice(0, 4).map((h) => ({
    action: h.is_verified === 1 ? "Hostel verified" : "Hostel pending verification",
    hostel: h.name,
    time: "Recently",
    type: h.is_verified === 1 ? "verified" : "new",
  }));

  return (
    <DashboardLayout role="admin" title="Admin Dashboard" subtitle="Platform overview and management">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Verifications Alert */}
        {pendingCount > 0 && (
          <Card className="lg:col-span-2 bg-warning/10 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Pending Verifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingCount} hostel{pendingCount !== 1 && 's'} waiting for review. 
                    New submissions should be verified within 48 hours.
                  </p>
                </div>
                <a href="/admin/verification" className="text-primary hover:underline font-medium">
                  Review Now →
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'verified' ? 'bg-accent/20 text-accent' :
                    activity.type === 'alert' ? 'bg-destructive/20 text-destructive' :
                    activity.type === 'new' ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {activity.type === 'verified' ? <CheckCircle className="h-4 w-4" /> :
                     activity.type === 'alert' ? <AlertCircle className="h-4 w-4" /> :
                     <Building2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.hostel}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Verification Rate</span>
                  <span className="font-medium">{Math.round((verifiedCount / allHostels.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(verifiedCount / allHostels.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">4.4</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">Rs 8.5K</p>
                  <p className="text-sm text-muted-foreground">Avg Rent</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Cities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Info */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Admin Panel:</strong> Use this dashboard to monitor platform activity, 
          verify new hostel submissions, and manage listings. All verification actions are logged.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
