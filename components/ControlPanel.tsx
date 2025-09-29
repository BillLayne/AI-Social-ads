import React, { useState } from 'react';
import { AdCreative, AspectRatio, ArtisticStyle } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import RefreshIcon from './icons/RefreshIcon';
import TrashIcon from './icons/TrashIcon';
import { generateAdIdeas, enhancePrompt } from '../services/geminiService';
import { stylePresets } from './StylePresets';

interface ControlPanelProps {
  adCreative: AdCreative;
  setAdCreative: React.Dispatch<React.SetStateAction<AdCreative>>;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
}

const EXAMPLE_PROMPTS = [
  "A squirrel wearing a tiny hard-hat is fixing a small hole in a house roof.",
  "A golden retriever driving a convertible car, wearing sunglasses, looking very proud.",
  "A rubber duck calmly floating in a flooded kitchen.",
  "A cat accidentally knocking over a very expensive vase, with a guilty look on its face.",
  "A car covered entirely in bubble wrap for protection in a parking lot."
];

const ControlPanel: React.FC<ControlPanelProps> = ({ adCreative, setAdCreative, onGenerate, isLoading, error }) => {
  const [ideas, setIdeas] = useState<string[]>(EXAMPLE_PROMPTS);
  const [isIdeasLoading, setIsIdeasLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdCreative(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdCreative(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };
  
  const handleArtisticStyleChange = (style: ArtisticStyle) => {
    setAdCreative(prev => ({ ...prev, artisticStyle: style }));
  };

  const handleExampleClick = (prompt: string) => {
    setAdCreative(prev => ({ ...prev, prompt }));
  };

  const handleGenerateIdeas = async () => {
    setIsIdeasLoading(true);
    try {
      const newIdeas = await generateAdIdeas();
      if (Array.isArray(newIdeas) && newIdeas.length > 0) {
        setIdeas(newIdeas);
      }
    } catch (err) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setIsIdeasLoading(false);
    }
  };
  
  const handleEnhancePrompt = async () => {
    if (!adCreative.prompt) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const enhanced = await enhancePrompt(adCreative.prompt);
      setAdCreative(prev => ({ ...prev, prompt: enhanced }));
    } catch (err: any) {
      setEnhanceError(err.message || "Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleClearAll = () => {
    setAdCreative({
      prompt: '',
      adCopy: '',
      aspectRatio: AspectRatio.SQUARE,
      artisticStyle: ArtisticStyle.PHOTOREALISTIC,
      numberOfImages: 1,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg h-full overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">1. Describe your ad scene</h2>
          <p className="text-sm text-slate-500 mt-1">Be creative. Or, write a simple idea and let AI enhance it!</p>
          <textarea
            name="prompt"
            value={adCreative.prompt}
            onChange={handleInputChange}
            placeholder="e.g., A dog wearing a firefighter helmet puts out a tiny kitchen fire with a water gun."
            className="mt-2 w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            rows={4}
          />
           <div className="mt-2 flex flex-col items-start">
            <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || isLoading || !adCreative.prompt}
                className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-semibold py-2 px-3 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                {isEnhancing ? (
                  <>
                     <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Enhance with AI
                  </>
                )}
            </button>
            {enhanceError && <p className="mt-1 text-xs text-red-600">{enhanceError}</p>}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Need inspiration? Try one of these:</p>
              <button
                onClick={handleGenerateIdeas}
                disabled={isIdeasLoading}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:text-slate-400 disabled:cursor-wait transition-colors"
                aria-label="Generate new ideas"
              >
                {isIdeasLoading ? (
                  <RefreshIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ideas.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs hover:bg-slate-200 transition-colors"
                >
                  {prompt.split(' ').slice(0, 3).join(' ')}...
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">2. Choose an artistic style</h2>
            <div className="mt-2 grid grid-cols-3 gap-3">
            {stylePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleArtisticStyleChange(preset.id)}
                className={`text-center group focus:outline-none rounded-lg ${
                  adCreative.artisticStyle === preset.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                }`}
              >
                <div className="aspect-square overflow-hidden rounded-lg border border-slate-300 group-hover:border-indigo-400 transition-colors">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                      adCreative.artisticStyle === preset.id ? 'scale-105' : ''
                    }`}
                  />
                </div>
                <p
                  className={`mt-1.5 text-xs font-semibold transition-colors ${
                    adCreative.artisticStyle === preset.id
                      ? 'text-indigo-600'
                      : 'text-slate-600 group-hover:text-slate-800'
                  }`}
                >
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-slate-800">3. Add your ad copy</h2>
          <p className="text-sm text-slate-500 mt-1">This text will be overlaid on the image.</p>
          <input
            type="text"
            name="adCopy"
            value={adCreative.adCopy}
            onChange={handleInputChange}
            placeholder="e.g., Life happens. We've got you."
            className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">4. Configure output</h2>
          <div className="mt-2 space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">Format</label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                    {[AspectRatio.SQUARE, AspectRatio.VERTICAL].map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAdCreative(p => ({...p, aspectRatio: ratio}))}
                            className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${adCreative.aspectRatio === ratio ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
                        >
                            <div className={ratio === AspectRatio.SQUARE ? "w-10 h-10 bg-slate-300 rounded-sm" : "w-8 h-12 bg-slate-300 rounded-sm"}></div>
                            <span className="mt-2 font-medium text-sm text-slate-700">{ratio === AspectRatio.SQUARE ? 'Post (1:1)' : 'Reel (9:16)'}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Number of Images</label>
               <div className="mt-1 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setAdCreative(p => ({...p, numberOfImages: num}))}
                    className={`p-3 border rounded-lg text-center font-semibold transition-colors ${
                      adCreative.numberOfImages === num ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGenerate}
              disabled={isLoading || !adCreative.prompt || isEnhancing}
              className="flex-grow w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate Image{adCreative.numberOfImages > 1 ? 's' : ''}
                </>
              )}
            </button>
            <button
                type="button"
                onClick={handleClearAll}
                title="Clear All Fields"
                className="flex-shrink-0 flex items-center justify-center px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-200"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
