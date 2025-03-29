
import { Header } from "@/components/Header";
import { Award, BookOpen, HelpCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
              Empowering communication through AI voice cloning technology
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed mb-6">
              AI voice cloning technology stands out for its profound impact on users with speech impairments, offering a powerful combination of emotional and technical benefits. By leveraging advanced AI models like Tacotron and ElevenLabs, this technology allows individuals to communicate in their own voice, even if they have lost the ability to speak.
            </p>
            <p className="text-lg leading-relaxed">
              This technology not only supports individuals with disabilities but also fosters inclusivity in education, media, and social interactions, making it a transformative tool for a more accessible world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Info className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Empowering Communication</CardTitle>
                  <CardDescription>Breaking barriers with natural voice</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enables people with speech impairments to express themselves naturally, reducing stigma and improving personal identity. Our platform enhances accessibility for all users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <BookOpen className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Personalized Experience</CardTitle>
                  <CardDescription>Customized to feel familiar</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Offers customized voices that feel familiar and comfortable, enhancing engagement and inclusivity. Each voice is uniquely tailored to represent the individual's identity.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Award className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Breaking Barriers</CardTitle>
                  <CardDescription>Multilingual content creation</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Facilitates multilingual content creation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Bridges language gaps across communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Expands global reach for all users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-voiceback-100 dark:bg-voiceback-900 text-voiceback-500 p-1 rounded-full mt-0.5">•</span>
                    <span>Creates more inclusive digital experiences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <HelpCircle className="h-6 w-6 text-voiceback-500" />
                <div>
                  <CardTitle>Technology & Support</CardTitle>
                  <CardDescription>Advanced AI models</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our platform leverages cutting-edge AI models like Tacotron and ElevenLabs to provide natural-sounding voice synthesis for users with speech impairments.
                </p>
                <p className="text-muted-foreground">
                  We're committed to fostering inclusivity in education, media, and social interactions, making communication accessible for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
