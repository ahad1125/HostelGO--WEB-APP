import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { hostelApi, Hostel } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
const facilityOptions = ["WiFi", "AC", "Food", "Laundry", "Gym", "Parking", "Security", "CCTV", "Power Backup", "Study Room", "Library", "Housekeeping"];

const EditHostel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    rent: "",
    description: "",
    facilities: [] as string[],
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (id) {
      fetchHostel();
    }
  }, [id, user, navigate]);

  const fetchHostel = async () => {
    setIsLoading(true);
    try {
      const data = await hostelApi.getById(parseInt(id!));
      setHostel(data);
      setFormData({
        name: data.name,
        city: data.city,
        address: data.address,
        rent: data.rent.toString(),
        description: "",
        facilities: data.facilities.split(', ').filter(f => f.trim()),
      });
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

  const handleFacilityChange = (facility: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, facilities: [...formData.facilities, facility] });
    } else {
      setFormData({ ...formData, facilities: formData.facilities.filter(f => f !== facility) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await hostelApi.update(parseInt(id!), {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        rent: parseInt(formData.rent),
        facilities: formData.facilities.join(', ')
      });
      
      toast({
        title: "Hostel updated!",
        description: "Your changes have been saved",
      });
      
      navigate("/owner/my-hostels");
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="owner" title="Edit Hostel">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hostel) {
    return (
      <DashboardLayout role="owner" title="Hostel Not Found">
        <div className="text-center py-16">
          <h2 className="font-heading text-2xl font-semibold mb-4">Hostel Not Found</h2>
          <Button onClick={() => navigate("/owner/my-hostels")}>Back to My Hostels</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="owner" title="Edit Hostel" subtitle={hostel.name}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hostel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent (Rs) *</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Facilities & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {facilityOptions.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${facility}`}
                        checked={formData.facilities.includes(facility)}
                        onCheckedChange={(checked) => handleFacilityChange(facility, checked as boolean)}
                        disabled={isSaving}
                      />
                      <label
                        htmlFor={`edit-${facility}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {facility}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate(-1)} disabled={isSaving}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <div className={`p-4 rounded-lg ${hostel.is_verified === 1 ? 'bg-accent/10 border border-accent/20' : 'bg-warning/10 border border-warning/20'}`}>
              <p className="text-sm">
                <strong>Status:</strong> {hostel.is_verified === 1 ? 'Verified' : 'Pending Verification'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hostel.is_verified === 1
                  ? 'Your hostel is visible to students.'
                  : 'Your hostel is under review by admin.'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EditHostel;
