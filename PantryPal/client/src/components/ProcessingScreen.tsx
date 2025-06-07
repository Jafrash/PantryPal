import { Card, CardContent } from "@/components/ui/card";
import { Brain, Check, Loader2 } from "lucide-react";

const processingSteps = [
  { id: 1, label: "Detecting ingredients", status: "complete" },
  { id: 2, label: "Matching recipes", status: "processing" },
  { id: 3, label: "Calculating scores", status: "pending" },
];

export default function ProcessingScreen() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="shadow-lg">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="text-primary text-2xl h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Analyzing Your Ingredients</h3>
            <p className="text-neutral-600 mb-8">Our AI is identifying your ingredients and finding the perfect recipes...</p>
            
            <div className="space-y-4">
              {processingSteps.map((step) => (
                <div 
                  key={step.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-neutral-700">{step.label}</span>
                  <div className="flex items-center">
                    {step.status === "complete" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {step.status === "processing" && (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    )}
                    {step.status === "pending" && (
                      <div className="w-4 h-4 border-2 border-neutral-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
