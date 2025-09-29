
import React from 'react';
import { AdCreative, AspectRatio } from '../types';
import SparklesIcon from './icons/SparklesIcon';

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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdCreative(prev => ({ ...prev, [name]: value }));
  };

  const handleAspectRatioChange = (aspectRatio: AspectRatio) => {
    setAdCreative(prev => ({ ...prev, aspectRatio }));
  };

  const handleExampleClick = (prompt: string) => {
    setAdCreative(prev => ({ ...prev, prompt }));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg h-full overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">1. Describe your ad scene</h2>
          <p className="text-sm text-slate-500 mt-1">Be creative and descriptive. What's the funny situation?</p>
          <textarea
            name="prompt"
            value={adCreative.prompt}
            onChange={handleInputChange}
            placeholder="e.g., A dog wearing a firefighter helmet puts out a tiny kitchen fire with a water gun."
            className="mt-2 w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            rows={4}
          />
          <div className="mt-2">
            <p className="text-xs font-medium text-slate-600 mb-2">Need ideas? Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
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
          <h2 className="text-lg font-semibold text-slate-800">2. Add your ad copy</h2>
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
          <h2 className="text-lg font-semibold text-slate-800">3. Choose format</h2>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAspectRatioChange(AspectRatio.SQUARE)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${adCreative.aspectRatio === AspectRatio.SQUARE ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
            >
              <div className="w-10 h-10 bg-slate-300 rounded-sm"></div>
              <span className="mt-2 font-medium text-sm text-slate-700">Post (1:1)</span>
            </button>
            <button
              onClick={() => handleAspectRatioChange(AspectRatio.VERTICAL)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${adCreative.aspectRatio === AspectRatio.VERTICAL ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
            >
              <div className="w-8 h-12 bg-slate-300 rounded-sm"></div>
              <span className="mt-2 font-medium text-sm text-slate-700">Reel/Story (9:16)</span>
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={onGenerate}
            disabled={isLoading || !adCreative.prompt}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
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
                Generate Image
              </>
            )}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
