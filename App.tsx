

import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ImageCanvas from './components/ImageCanvas';
import { AdCreative, AspectRatio, SocialMediaCopy, ArtisticStyle } from './types';
import { generateAdImage, generateSocialMediaCopy, editAdImage } from './services/geminiService';

function App() {
  const [adCreative, setAdCreative] = useState<AdCreative>({
    prompt: "A clumsy robot spilling a can of paint on a pristine white carpet in a modern living room.",
    adCopy: "",
    aspectRatio: AspectRatio.SQUARE,
    artisticStyle: ArtisticStyle.PHOTOREALISTIC,
    numberOfImages: 1,
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socialMediaCopy, setSocialMediaCopy] = useState<SocialMediaCopy | null>(null);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!adCreative.prompt) {
      setError("Please enter a prompt to describe the scene.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setSocialMediaCopy(null);
    setCopyError(null);

    try {
      const images = await generateAdImage(adCreative);
      setGeneratedImages(images);
      setSelectedImageIndex(0);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [adCreative]);

  const handleEditImage = useCallback(async (editPrompt: string) => {
    if (selectedImageIndex === null || !generatedImages[selectedImageIndex]) return;

    setIsEditing(true);
    setError(null);
    setCopyError(null);
    setSocialMediaCopy(null); 

    try {
      const imageToEdit = generatedImages[selectedImageIndex];
      const editedImage = await editAdImage(imageToEdit, editPrompt);
      const newImages = [...generatedImages];
      newImages[selectedImageIndex] = editedImage;
      setGeneratedImages(newImages);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during editing.");
    } finally {
      setIsEditing(false);
    }
  }, [generatedImages, selectedImageIndex]);

  const handleGenerateCopy = useCallback(async () => {
    setIsCopyLoading(true);
    setCopyError(null);
    setSocialMediaCopy(null);
    try {
      const copy = await generateSocialMediaCopy(adCreative);
      setSocialMediaCopy(copy);
    } catch (err: any) {
      setCopyError(err.message || "An unknown error occurred.");
    } finally {
      setIsCopyLoading(false);
    }
  }, [adCreative]);

  const handleStartOver = () => {
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
    setSocialMediaCopy(null);
    setCopyError(null);
    setIsLoading(false);
    setIsCopyLoading(false);
    setIsEditing(false);
  };
  
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    setSocialMediaCopy(null);
    setCopyError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="lg:h-[calc(100vh-10rem)]">
            <ControlPanel
              adCreative={adCreative}
              setAdCreative={setAdCreative}
              onGenerate={handleGenerate}
              isLoading={isLoading || isEditing}
              error={error}
            />
          </div>
          <div className="lg:h-[calc(100vh-10rem)]">
            <ImageCanvas 
              adCreative={adCreative} 
              generatedImages={generatedImages} 
              isLoading={isLoading} 
              onGenerateCopy={handleGenerateCopy}
              socialMediaCopy={socialMediaCopy}
              isCopyLoading={isCopyLoading}
              copyError={copyError}
              onStartOver={handleStartOver}
              onEditImage={handleEditImage}
              isEditing={isEditing}
              selectedImageIndex={selectedImageIndex}
              onSelectImage={handleSelectImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
