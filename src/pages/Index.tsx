
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { SupabaseConnectionStatus } from "@/components/SupabaseConnectionStatus";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6">
        <SupabaseConnectionStatus />
        <VoiceForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
