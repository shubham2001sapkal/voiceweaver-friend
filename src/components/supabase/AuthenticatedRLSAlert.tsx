
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function AuthenticatedRLSAlert() {
  return (
    <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>User Authentication Issue</AlertTitle>
      <AlertDescription>
        <p className="mb-2">You're signed in but still unable to insert records. Check that:</p>
        <ol className="list-decimal pl-5 mb-3 space-y-1">
          <li>Your RLS policy is correctly configured for the 'authenticated' role</li>
          <li>The session token is being properly passed in requests</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
}
