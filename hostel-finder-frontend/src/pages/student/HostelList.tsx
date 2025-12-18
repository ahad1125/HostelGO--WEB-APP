import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import HostelCard from "@/components/HostelCard";
import { hostelApi, Hostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchFilters {
  city: string;
  maxRent: string;
  facility: string;
}

const HostelList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    maxRent: "",
    facility: ""
  });

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

  const handleSearch = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    try {
      const hasFilters = newFilters.city || newFilters.maxRent || newFilters.facility;
      
      if (hasFilters) {
        const data = await hostelApi.search({
          city: newFilters.city || undefined,
          maxRent: newFilters.maxRent && newFilters.maxRent !== "any" ? parseInt(newFilters.maxRent) : undefined,
          facility: newFilters.facility || undefined
        });
        setHostels(data);
      } else {
        await fetchHostels();
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search hostels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeFiltersCount = [filters.city, filters.maxRent, filters.facility].filter(Boolean).length;

  // Transform API hostel to HostelCard format
  const transformHostel = (hostel: Hostel) => ({
    id: hostel.id.toString(),
    name: hostel.name,
    address: hostel.address,
    city: hostel.city,
    rent: hostel.rent,
    facilities: hostel.facilities.split(', '),
    rating: 4.5, // Default rating since API doesn't provide it
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    isVerified: hostel.is_verified === 1,
  });

  return (
    <DashboardLayout 
      role="student" 
      title="Browse Hostels" 
      subtitle="Find verified hostels near your college"
    >
      {/* Search Section */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl font-semibold">
            {hostels.length} Hostel{hostels.length !== 1 && "s"} Found
          </h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} filter{activeFiltersCount !== 1 && "s"} applied
            </Badge>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <Badge variant="outline" className="text-xs">
              City: {filters.city}
            </Badge>
          )}
          {filters.maxRent && filters.maxRent !== "any" && (
            <Badge variant="outline" className="text-xs">
              Max Rent: Rs {parseInt(filters.maxRent).toLocaleString()}
            </Badge>
          )}
          {filters.facility && (
            <Badge variant="outline" className="text-xs">
              Facility: {filters.facility}
            </Badge>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading hostels...</span>
        </div>
      ) : hostels.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={transformHostel(hostel)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <div className="max-w-md mx-auto">
            <h3 className="font-heading text-xl font-semibold mb-2">No Hostels Found</h3>
            <p className="text-muted-foreground mb-4">
              No hostels match your current search criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {
                setFilters({ city: "", maxRent: "", facility: "" });
                fetchHostels();
              }}
              className="text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Note:</strong> Only verified hostels are displayed here. 
          All listings have been reviewed by our admin team for authenticity.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default HostelList;
