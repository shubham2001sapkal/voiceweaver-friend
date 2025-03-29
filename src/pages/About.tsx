
import { Header } from "@/components/Header";
import { Award, BookOpen, HelpCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-voiceback-500 to-voiceback-400 bg-clip-text text-transparent mb-4">
              About Knoxed CreatiCode
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering creativity through innovative coding solutions
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed mb-6">
              Knoxed CreatiCode is an advanced platform designed to merge creativity with coding, making technology more accessible and empowering for everyone. Our mission is to break down barriers between technical implementation and creative vision, allowing users to build powerful applications without getting lost in complex code.
            </p>
            <p className="text-lg leading-relaxed">
              Whether you're a professional developer, a design enthusiast, or someone with a great idea but limited technical background, our tools and resources will help you bring your vision to life with ease and confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Info className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>Building technology for everyone</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe that coding should be accessible to everyone. Our platform bridges the gap between technical knowledge and creative vision, enabling users to create applications that reflect their unique ideas without being limited by technical constraints.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <BookOpen className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Learning Approach</CardTitle>
                  <CardDescription>Interactive and engaging</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our platform provides not just tools, but an educational journey. Learn as you build with interactive guides, best practices, and community support that makes the development process an enriching experience for all skill levels.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Award className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Key Benefits</CardTitle>
                  <CardDescription>Why choose Knoxed CreatiCode</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Intuitive interface for both beginners and experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Real-time collaboration features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Extensive template library to jumpstart projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Integrated testing and deployment tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <HelpCircle className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Support & Community</CardTitle>
                  <CardDescription>You're never alone</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join our thriving community of creators, developers, and innovators. Share ideas, get help, and collaborate on projects that matter.
                </p>
                <p className="text-muted-foreground">
                  Our dedicated support team is always available to help you overcome any challenges you might face during your creative coding journey.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-voiceback-50 to-voiceback-100 dark:from-voiceback-950 dark:to-voiceback-900 p-8 rounded-lg border border-voiceback-200 dark:border-voiceback-800">
            <h2 className="text-2xl font-bold text-center mb-6">Ready to Start Your Creative Coding Journey?</h2>
            <p className="text-center text-lg mb-6">
              Join thousands of creators who are already building amazing applications with Knoxed CreatiCode.
            </p>
            <div className="flex justify-center">
              <Button 
                className="bg-voiceback-500 hover:bg-voiceback-600 text-white"
                size="lg"
                asChild
              >
                <Link to="/">
                  Explore the Platform
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
