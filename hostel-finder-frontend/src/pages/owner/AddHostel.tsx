import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Loader2, X } from "lucide-react";
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
import { hostelApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala"];
const facilityOptions = ["WiFi", "AC", "Food", "Laundry", "Gym", "Parking", "Security", "CCTV", "Power Backup", "Study Room", "Library", "Housekeeping"];

const AddHostel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

    // Validate file size (max 5MB original file)
    // Note: Images will be compressed to max 1200x800px and converted to JPEG at 0.7 quality
    // This should result in files well under 2MB when base64 encoded
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB. The image will be automatically compressed.`,
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
        // Quality 0.6 provides good balance between file size and visual quality
        // This should keep base64 size well under 2MB for most images
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        // Warn if compressed image is still large (over 1.5MB base64)
        if (compressedBase64.length > 1.5 * 1024 * 1024) {
          toast({
            title: "Large image detected",
            description: `Compressed image is ${Math.round(compressedBase64.length / 1024)}KB. Consider using a smaller or simpler image for better performance.`,
            variant: "default",
          });
        }
        
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
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.address.trim() || !formData.city || !formData.rent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Hostel Name, City, Address, and Rent)",
        variant: "destructive",
      });
      return;
    }

    // Validate rent is a valid number
    const rentValue = parseInt(formData.rent);
    if (isNaN(rentValue) || rentValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid rent amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the hostel data - only include image_url if it's provided and not empty
      const hostelData: any = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city,
        rent: rentValue,
        facilities: formData.facilities.length > 0 ? formData.facilities.join(', ') : '',
      };

      // Only add image_url if it's provided and not empty
      if (formData.image_url && formData.image_url.trim() !== '') {
        // Check if it's a valid base64 or URL
        const trimmedUrl = formData.image_url.trim();
        if (trimmedUrl.startsWith('data:image/') || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          hostelData.image_url = trimmedUrl;
        }
      }

      await hostelApi.create(hostelData);
      
      toast({
        title: "Hostel submitted!",
        description: "Your hostel has been submitted for verification",
      });
      
      navigate("/owner/my-hostels");
    } catch (error: any) {
      console.error("Error creating hostel:", error);
      toast({
        title: "Failed to add hostel",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="owner" title="Add New Hostel" subtitle="List your property on HostelGo">
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
                    placeholder="Enter hostel name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={isLoading}
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
                      placeholder="e.g., 8000"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street, Area, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your hostel, its surroundings, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    disabled={isLoading}
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
                        id={facility}
                        checked={formData.facilities.includes(facility)}
                        onCheckedChange={(checked) => handleFacilityChange(facility, checked as boolean)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={facility}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
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
                      setFormData({ ...formData, image_url: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="mt-2"
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
                          target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=60";
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.image_url.startsWith('data:') 
                        ? "Image uploaded from computer (base64)" 
                        : formData.image_url 
                        ? "Image from URL"
                        : ""}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit */}
            <Card>
              <CardContent className="p-6">
                <Button type="submit" className="w-full mb-4" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your hostel will be reviewed by our admin team before being listed publicly.
                </p>
              </CardContent>
            </Card>

            {/* Help */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Tips for Quick Verification</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add clear, high-quality photos</li>
                <li>• Provide accurate address details</li>
                <li>• List all available facilities</li>
                <li>• Include valid contact information</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AddHostel;
