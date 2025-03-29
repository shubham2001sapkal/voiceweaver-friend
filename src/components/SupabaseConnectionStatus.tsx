
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import { StatusIndicator } from "./supabase/ConnectionStatusIndicator";
import { AnonymousRLSAlert } from "./supabase/AnonymousRLSAlert";
import { AuthenticatedRLSAlert } from "./supabase/AuthenticatedRLSAlert";

export function SupabaseConnectionStatus() {
  const { connectionStatus, logTableStatus, rlsStatus, user } = useSupabaseConnection();

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
      
      <div className="space-y-4">
        <StatusIndicator 
          status={connectionStatus}
          label="Database"
          checkingText="Checking connection..."
          successText="Connected"
          failureText="Connection failed"
        />
        
        {connectionStatus === 'connected' && (
          <>
            <StatusIndicator 
              status={logTableStatus}
              label="Voice Logs Table"
              checkingText="Checking table..."
              successText="Table exists"
              failureText="Table not found"
            />
            
            {logTableStatus === 'available' && (
              <StatusIndicator 
                status={rlsStatus}
                label="RLS Policies"
                checkingText="Checking policies..."
                successText="Correctly configured"
                failureText="Need configuration"
                additionalText={user ? "despite being signed in" : "for anonymous access"}
              />
            )}
          </>
        )}
      </div>
      
      {rlsStatus === 'not_configured' && !user && <AnonymousRLSAlert />}
      {rlsStatus === 'not_configured' && user && <AuthenticatedRLSAlert />}
    </div>
  );
}
