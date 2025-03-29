
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase } from "@/context/SupabaseContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useSupabase();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // Wait for the auth state to be loaded
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);
  
  // Show nothing while checking authentication
  if (checking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex space-x-4">
          <div className="h-3 w-3 bg-voiceback-500 rounded-full"></div>
          <div className="h-3 w-3 bg-voiceback-400 rounded-full"></div>
          <div className="h-3 w-3 bg-voiceback-300 rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected content
  return <>{children}</>;
}
