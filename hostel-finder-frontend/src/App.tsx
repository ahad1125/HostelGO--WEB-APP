import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import HostelList from "./pages/student/HostelList";
import HostelDetail from "./pages/student/HostelDetail";
import StudentEnquiries from "./pages/student/StudentEnquiries";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AddHostel from "./pages/owner/AddHostel";
import MyHostels from "./pages/owner/MyHostels";
import EditHostel from "./pages/owner/EditHostel";
import OwnerEnquiries from "./pages/owner/OwnerEnquiries";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHostels from "./pages/admin/AdminHostels";
import AdminVerification from "./pages/admin/AdminVerification";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/hostels" element={<HostelList />} />
              <Route path="/student/hostel/:id" element={<HostelDetail />} />
              <Route path="/student/enquiries" element={<StudentEnquiries />} />

              {/* Owner Routes */}
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/add-hostel" element={<AddHostel />} />
              <Route path="/owner/my-hostels" element={<MyHostels />} />
              <Route path="/owner/edit-hostel/:id" element={<EditHostel />} />
              <Route path="/owner/enquiries" element={<OwnerEnquiries />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/hostels" element={<AdminHostels />} />
              <Route path="/admin/verification" element={<AdminVerification />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
