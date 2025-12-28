import { useEffect, useState } from "react";
import { Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { hostelApi, type Hostel as ApiHostel } from "@/lib/api";
import { getHostelImage } from "@/utils/hostelImages";

interface HostelCarouselProps {
  autoSlideInterval?: number; // in milliseconds, default 5000 (5 seconds)
}

const HostelCarousel = ({ autoSlideInterval = 5000 }: HostelCarouselProps) => {
  const [hostels, setHostels] = useState<ApiHostel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hostels (using public endpoint - no auth required)
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 HostelCarousel: Fetching hostels...");
        // Use public endpoint that doesn't require authentication
        const data = await hostelApi.getPublic();
        console.log("✅ HostelCarousel: Received", data.length, "hostels");
        setHostels(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("❌ HostelCarousel: Error fetching hostels:", error);
        console.error("Error details:", error.message, error.stack);
        // If fetch fails, use empty array (will show fallback card)
        setHostels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!api || hostels.length <= 1) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Loop back to start
        api.scrollTo(0);
      }
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [api, hostels.length, autoSlideInterval]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Calculate average rating (placeholder until backend supports it)
  const getRating = (hostel: ApiHostel) => {
    // For now, return a default rating
    // In the future, this could calculate from reviews
    return 4.5;
  };

  // Get default image
  const getImage = (hostel: ApiHostel) => {
    return getHostelImage(hostel.id, hostel.image_url);
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg animate-pulse">
          <div className="w-full h-80 bg-muted" />
          <div className="p-6">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-6 bg-muted rounded w-48 mb-1" />
            <div className="h-4 bg-muted rounded w-40" />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-2 bg-card border-2 border-border rounded-xl p-4 shadow-lg">
          <div className="h-12 w-12 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  if (hostels.length === 0) {
    // Fallback to static card if no hostels available
    return (
      <div className="relative">
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg">
          <img
            src={getHostelImage(0)}
            alt="Modern hostel room"
            className="w-full h-80 object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80`;
              target.onerror = null;
            }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Verified Hostel</span>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-1">Gulberg Boys Hostel</h3>
            <p className="text-muted-foreground">Lahore • Rs 15,000/month</p>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-2 bg-card border-2 border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-2xl">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {hostels.map((hostel) => (
            <CarouselItem key={hostel.id}>
              <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={getImage(hostel)}
                  alt={hostel.name}
                  className="w-full h-80 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80`;
                    target.onerror = null; // Prevent infinite loop
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-accent">Verified Hostel</span>
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-1">{hostel.name}</h3>
                  <p className="text-muted-foreground">
                    {hostel.city} • Rs {hostel.rent?.toLocaleString() || "N/A"}/month
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Floating rating card */}
      {hostels.length > 0 && (
        <div className="absolute -bottom-6 -right-2 bg-card border-2 border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-2xl">{getRating(hostels[currentIndex] || hostels[0]).toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Dots indicator */}
      {hostels.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {hostels.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted hover:bg-primary/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelCarousel;

