import { Hostel } from "@/components/HostelCard";

export const mockHostels: Hostel[] = [
  {
    id: "1",
    name: "Gulberg Boys Hostel",
    city: "Lahore",
    address: "Near Liberty Market, Gulberg III",
    rent: 15000,
    rating: 4.5,
    facilities: ["WiFi", "AC", "Food", "Laundry", "Security"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner1"
  },
  {
    id: "2",
    name: "Johar Town Student Hostel",
    city: "Lahore",
    address: "Block R1, Johar Town",
    rent: 12000,
    rating: 4.4,
    facilities: ["WiFi", "Food", "Parking", "Security"],
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner2"
  },
  {
    id: "3",
    name: "DHA Girls Hostel",
    city: "Lahore",
    address: "Phase 5, DHA",
    rent: 18000,
    rating: 4.6,
    facilities: ["WiFi", "AC", "Food", "Power Backup"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=60",
    isVerified: false,
    ownerId: "owner3"
  },
  {
    id: "4",
    name: "G-10 Student Hostel",
    city: "Islamabad",
    address: "Street 43, Sector G-10/2",
    rent: 14000,
    rating: 4.3,
    facilities: ["WiFi", "Food", "Study Room", "CCTV"],
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner1"
  },
  {
    id: "5",
    name: "Blue Area Boys Hostel",
    city: "Islamabad",
    address: "Near Jinnah Avenue, Blue Area",
    rent: 16000,
    rating: 4.1,
    facilities: ["WiFi", "AC", "Food", "Parking"],
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=60",
    isVerified: false,
    ownerId: "owner2"
  },
  {
    id: "6",
    name: "University Road Hostel",
    city: "Karachi",
    address: "Near NIPA Chowrangi, University Road",
    rent: 13000,
    rating: 4.2,
    facilities: ["WiFi", "Food", "Laundry", "CCTV"],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner3"
  },
  {
    id: "7",
    name: "PECHS Girls Hostel",
    city: "Karachi",
    address: "Block 6, PECHS",
    rent: 17000,
    rating: 4.7,
    facilities: ["WiFi", "AC", "Food", "Housekeeping"],
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner1"
  },
  {
    id: "8",
    name: "Saddar Student Lodge",
    city: "Rawalpindi",
    address: "Near Mall Road, Saddar",
    rent: 11000,
    rating: 4.0,
    facilities: ["WiFi", "Food", "Study Room"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
    isVerified: true,
    ownerId: "owner2"
  }
];

export const getVerifiedHostels = () => mockHostels.filter(h => h.isVerified);
export const getUnverifiedHostels = () => mockHostels.filter(h => !h.isVerified);
export const getHostelById = (id: string) => mockHostels.find(h => h.id === id);
export const getHostelsByOwner = (ownerId: string) => mockHostels.filter(h => h.ownerId === ownerId);
