
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function AnonymousRLSAlert() {
  return (
    <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Anonymous Access Blocked by RLS</AlertTitle>
      <AlertDescription>
        <p className="mb-2">You are currently not signed in, and the RLS policy is set to only allow authenticated users to insert records. You have two options:</p>
        <ol className="list-decimal pl-5 mb-3 space-y-1">
          <li>Sign in to your account (recommended)</li>
          <li>Update the RLS policy to allow anonymous access using this SQL in your Supabase dashboard:</li>
        </ol>
        <div className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto mb-3">
          <pre><code>CREATE POLICY "Enable insert for anonymous users" ON "public"."voice_logs"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);</code></pre>
        </div>
      </AlertDescription>
    </Alert>
  );
}
