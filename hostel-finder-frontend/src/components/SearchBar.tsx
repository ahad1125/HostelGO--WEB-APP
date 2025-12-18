import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilters {
  city: string;
  maxRent: string;
  facility: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

const cities = [
  "All Cities",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta"
];

const rentRanges = [
  { label: "Any Price", value: "" },
  { label: "Under Rs 5,000", value: "5000" },
  { label: "Under Rs 10,000", value: "10000" },
  { label: "Under Rs 15,000", value: "15000" },
  { label: "Under Rs 20,000", value: "20000" },
];

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    maxRent: "",
    facility: "",
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({ city: "", maxRent: "", facility: "" });
    onSearch({ city: "", maxRent: "", facility: "" });
  };

  const hasActiveFilters = filters.city || filters.maxRent || filters.facility;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Main Search Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by facility (WiFi, AC, Parking...)"
            value={filters.facility}
            onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                City
              </label>
              <Select
                value={filters.city}
                onValueChange={(value) => setFilters({ ...filters, city: value === "All Cities" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Maximum Rent
              </label>
              <Select
                value={filters.maxRent}
                onValueChange={(value) => setFilters({ ...filters, maxRent: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max rent" />
                </SelectTrigger>
                <SelectContent>
                  {rentRanges.map((range) => (
                    <SelectItem key={range.value || "any"} value={range.value || "any"}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClear} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* API Query Preview - Educational */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-mono">
              <span className="font-medium">API Query Preview: </span>
              /hostels/search?city={filters.city || "[any]"}&maxRent={filters.maxRent || "[any]"}&facility={filters.facility || "[any]"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
