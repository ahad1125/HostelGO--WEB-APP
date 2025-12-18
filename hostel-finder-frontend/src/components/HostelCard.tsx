import { Link } from "react-router-dom";
import { MapPin, Star, Wifi, Car, Utensils, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export interface Hostel {
  id: string;
  name: string;
  city: string;
  address: string;
  rent: number;
  rating: number;
  facilities: string[];
  image: string;
  isVerified: boolean;
  ownerId?: string;
}

interface HostelCardProps {
  hostel: Hostel;
  showActions?: boolean;
  showVerificationBadge?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onVerify?: (id: string) => void;
  onUnverify?: (id: string) => void;
}

const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  parking: <Car className="h-3 w-3" />,
  food: <Utensils className="h-3 w-3" />,
};

const HostelCard = ({ 
  hostel, 
  showActions = false,
  showVerificationBadge = false,
  onEdit,
  onDelete,
  onVerify,
  onUnverify
}: HostelCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={hostel.image}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showVerificationBadge && (
          <div className="absolute top-3 right-3">
            <Badge variant={hostel.isVerified ? "default" : "secondary"} className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {hostel.isVerified ? "Verified" : "Pending"}
            </Badge>
          </div>
        )}
        {hostel.isVerified && !showVerificationBadge && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-heading font-semibold text-lg line-clamp-1">{hostel.name}</h3>
          <div className="flex items-center gap-1 text-warning-foreground bg-warning/20 px-2 py-1 rounded">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="text-sm font-medium">{hostel.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{hostel.address}, {hostel.city}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-1 text-xl font-bold text-primary mb-3">
          <span>Rs {hostel.rent.toLocaleString()}</span>
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {hostel.facilities.slice(0, 4).map((facility) => (
            <Badge key={facility} variant="outline" className="text-xs">
              {facilityIcons[facility.toLowerCase()] || null}
              {facility}
            </Badge>
          ))}
          {hostel.facilities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{hostel.facilities.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {!showActions ? (
          <Link to={`/student/hostel/${hostel.id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        ) : (
          <>
            {onEdit && (
              <Button variant="outline" className="flex-1" onClick={() => onEdit(hostel.id)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" className="flex-1" onClick={() => onDelete(hostel.id)}>
                Delete
              </Button>
            )}
            {onVerify && !hostel.isVerified && (
              <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={() => onVerify(hostel.id)}>
                Verify
              </Button>
            )}
            {onUnverify && hostel.isVerified && (
              <Button variant="destructive" className="flex-1" onClick={() => onUnverify(hostel.id)}>
                Unverify
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default HostelCard;
