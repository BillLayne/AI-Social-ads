
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ImageCanvas from './components/ImageCanvas';
import { AdCreative, AspectRatio, SocialMediaCopy } from './types';
import { generateHumorousImage, generateSocialMediaCopy } from './services/geminiService';

function App() {
  const [adCreative, setAdCreative] = useState<AdCreative>({
    prompt: "A clumsy robot spilling a can of paint on a pristine white carpet in a modern living room.",
    adCopy: "Accidents happen. We're here to help.",
    aspectRatio: AspectRatio.SQUARE
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setGeneratedImage(null);
    setSocialMediaCopy(null);
    setCopyError(null);

    try {
      const image = await generateHumorousImage(adCreative.prompt, adCreative.aspectRatio);
      setGeneratedImage(image);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [adCreative.prompt, adCreative.aspectRatio]);

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
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="lg:h-[calc(100vh-10rem)]">
            <ImageCanvas 
              adCreative={adCreative} 
              generatedImage={generatedImage} 
              isLoading={isLoading} 
              onGenerateCopy={handleGenerateCopy}
              socialMediaCopy={socialMediaCopy}
              isCopyLoading={isCopyLoading}
              copyError={copyError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
