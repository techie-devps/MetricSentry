import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/metrics" component={() => <div className="p-6 text-white">Metrics page coming soon...</div>} />
      <Route path="/alerts" component={() => <div className="p-6 text-white">Alerts page coming soon...</div>} />
      <Route path="/targets" component={() => <div className="p-6 text-white">Targets page coming soon...</div>} />
      <Route path="/settings" component={() => <div className="p-6 text-white">Settings page coming soon...</div>} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
