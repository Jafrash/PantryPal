import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const processImage = () => {
    if (selectedImage) {
      onImageUpload(selectedImage);
    }
  };

  return (
    <div className="space-y-6">
      <Card 
        className="border-2 border-dashed border-neutral-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="p-8 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Selected ingredients" 
                  className="max-w-full max-h-64 rounded-lg shadow-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-600">
                  Image selected: {selectedImage?.name}
                </p>
                <Button 
                  onClick={processImage}
                  className="bg-primary text-white hover:bg-orange-600"
                  size="lg"
                >
                  Analyze Ingredients
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-primary text-2xl h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-neutral-900 mb-2">Capture Your Ingredients</h4>
              <p className="text-neutral-600 mb-6">Click to take a photo with your camera or drag and drop an image</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleCameraClick}
                  className="bg-primary text-white hover:bg-orange-600"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleUploadClick}
                  className="border border-neutral-300 hover:border-primary hover:text-primary"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
              
              <p className="text-xs text-neutral-500 mt-4">Supports JPG, PNG up to 10MB</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
