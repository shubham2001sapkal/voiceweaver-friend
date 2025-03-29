
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6">
        <VoiceForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
