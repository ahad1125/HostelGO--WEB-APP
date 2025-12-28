import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, User, Upload, X } from "lucide-react";
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

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala"];
const facilityOptions = ["WiFi", "AC", "Food", "Laundry", "Gym", "Parking", "Security", "CCTV", "Power Backup", "Study Room", "Library", "Housekeeping"];

const EditHostel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    rent: "",
    description: "",
    facilities: [] as string[],
    image_url: "",
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
        image_url: data.image_url || "",
      });
      setImagePreview(data.image_url || "");
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64 with compression
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Compress image if it's too large (base64 can be huge)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        setFormData({ ...formData, image_url: compressedBase64 });
        setImagePreview(compressedBase64);
      };
      img.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to process the image file",
          variant: "destructive",
        });
      };
      img.src = base64String;
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Failed to read the image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        facilities: formData.facilities.join(', '),
        image_url: formData.image_url && formData.image_url.trim() !== '' ? formData.image_url : undefined
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

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Hostel Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label>Upload Image from Computer</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-edit"
                      disabled={isSaving}
                    />
                    <label htmlFor="file-upload-edit" className={`cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                </div>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <Label htmlFor="image_url">Image URL (from Internet)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    placeholder="https://example.com/hostel-image.jpg"
                    value={formData.image_url && !formData.image_url.startsWith('data:') ? formData.image_url : ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, image_url: url });
                      setImagePreview(url);
                    }}
                    className="mt-2"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a direct image URL from the internet. If left empty, default images will be used automatically.
                  </p>
                </div>

                {/* Preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="relative mt-2 group">
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Hostel preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-border shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getHostelImage(hostel?.id || 0, null);
                          target.className = "w-full h-64 object-cover rounded-lg border-2 border-border shadow-md opacity-50";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImage}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.image_url.startsWith('data:') 
                        ? "Image uploaded from computer (base64)" 
                        : "Image from URL"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            {hostel.owner_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Owner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{hostel.owner_name}</span>
                  </div>
                </CardContent>
              </Card>
            )}

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
