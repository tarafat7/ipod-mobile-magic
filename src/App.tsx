
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import EditMyFive from "./pages/EditMyFive";
import MyFive from "./pages/MyFive";
import SearchFriends from "./pages/SearchFriends";
import MyFriends from "./pages/MyFriends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/edit-my-five" element={<EditMyFive />} />
          <Route path="/my-five/:userId" element={<MyFive />} />
          <Route path="/search-friends" element={<SearchFriends />} />
          <Route path="/my-friends" element={<MyFriends />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
