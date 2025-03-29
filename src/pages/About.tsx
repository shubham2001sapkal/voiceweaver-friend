
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-voiceback dark:text-primary">
              About VoiceBack
            </h1>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              Our mission is to restore voices for those who have lost them.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-voiceback dark:text-primary mb-4">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                VoiceBack was founded with a simple yet powerful mission: to help people who have lost their voice due to medical conditions regain the ability to speak in their own voice.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Using cutting-edge AI technology, we can clone a person's voice from just a few samples, allowing them to generate speech that sounds just like them.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-voiceback dark:text-primary mb-4">
                How It Works
              </h2>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Record several voice samples (at least 3 minutes of speech)</li>
                <li>Our AI analyzes your unique voice patterns</li>
                <li>We create a digital model of your voice</li>
                <li>Type any text and hear it spoken in your voice</li>
              </ol>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/">
              <Button size="lg" className="bg-voiceback dark:bg-primary hover:bg-voiceback-700 dark:hover:bg-primary/90">
                Try VoiceBack Today
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
