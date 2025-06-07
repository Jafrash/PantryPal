import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DietaryPrefs {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  keto: boolean;
}

interface DietaryPreferencesProps {
  preferences: DietaryPrefs;
  onPreferencesChange: (preferences: DietaryPrefs) => void;
  maxCookTime?: number;
  onMaxCookTimeChange: (time: number | undefined) => void;
}

export default function DietaryPreferences({
  preferences,
  onPreferencesChange,
  maxCookTime,
  onMaxCookTimeChange,
}: DietaryPreferencesProps) {
  const updatePreference = (key: keyof DietaryPrefs, value: boolean) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    });
  };

  const handleCookTimeChange = (value: string) => {
    if (value === "any") {
      onMaxCookTimeChange(undefined);
    } else {
      onMaxCookTimeChange(parseInt(value));
    }
  };

  const dietaryOptions = [
    { key: 'vegetarian' as const, label: 'Vegetarian' },
    { key: 'vegan' as const, label: 'Vegan' },
    { key: 'glutenFree' as const, label: 'Gluten-Free' },
    { key: 'keto' as const, label: 'Keto' },
  ];

  return (
    <Card className="mt-12 border border-neutral-200">
      <CardContent className="p-8">
        <h4 className="text-xl font-semibold text-neutral-900 mb-6">Dietary Preferences</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {dietaryOptions.map((option) => (
            <div 
              key={option.key}
              className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Checkbox
                id={option.key}
                checked={preferences[option.key]}
                onCheckedChange={(checked) => updatePreference(option.key, checked as boolean)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label 
                htmlFor={option.key}
                className="text-sm font-medium text-neutral-700 cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-neutral-700 mb-3">
            Maximum Cooking Time
          </Label>
          <Select 
            value={maxCookTime?.toString() || "any"} 
            onValueChange={handleCookTimeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select cooking time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2+ hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
