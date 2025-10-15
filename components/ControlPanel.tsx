import React, { useState } from 'react';
import { AdCreative, AspectRatio, ArtisticStyle, Platform, SocialMediaCopy, OutputType, AdIdea, GroundingSource, TargetAudience } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import RefreshIcon from './icons/RefreshIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import { generateAdIdeasFromSubject, enhancePrompt, generateAdCopyFromPrompt, generateTrendingAdIdeas } from '../services/geminiService';
import { stylePresets } from './StylePresets';

interface ControlPanelProps {
  adCreative: AdCreative;
  setAdCreative: React.Dispatch<React.SetStateAction<AdCreative>>;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  onGenerateCopy: () => void;
  isCopyLoading: boolean;
  copyError: string | null;
  socialMediaCopy: SocialMediaCopy | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  adCreative, 
  setAdCreative, 
  onGenerate, 
  isLoading, 
  error,
  onGenerateCopy,
  isCopyLoading,
  copyError,
  socialMediaCopy
}) => {
  const [ideas, setIdeas] = useState<AdIdea[]>([]);
  const [trendingSources, setTrendingSources] = useState<GroundingSource[]>([]);
  const [isIdeasLoading, setIsIdeasLoading] = useState(false);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [ideaSubject, setIdeaSubject] = useState('Humorous auto insurance ideas');
  const [ideaAudience, setIdeaAudience] = useState<TargetAudience>(TargetAudience.MILLENNIALS);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [autoGenerateCopy, setAutoGenerateCopy] = useState(true);
  const [isGeneratingAdCopy, setIsGeneratingAdCopy] = useState(false);
  
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

  const handleIdeaClick = async (idea: AdIdea) => {
    if (autoGenerateCopy) {
      setIsGeneratingAdCopy(true);
      setAdCreative(prev => ({ ...prev, prompt: idea.prompt, adCopy: '🤖 Generating witty copy...' }));
      try {
        const newAdCopy = await generateAdCopyFromPrompt(idea.prompt, adCreative.targetAudience);
        setAdCreative(prev => ({ ...prev, adCopy: newAdCopy }));
      } catch (err) {
        console.error("Failed to generate ad copy:", err);
        setAdCreative(prev => ({ ...prev, adCopy: '' }));
      } finally {
        setIsGeneratingAdCopy(false);
      }
    } else {
      setAdCreative(prev => ({ ...prev, prompt: idea.prompt, adCopy: '' }));
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ideaSubject) return;
    setIsIdeasLoading(true);
    setIdeas([]);
    setTrendingSources([]);
    setIdeaError(null);
    try {
      const newIdeas = await generateAdIdeasFromSubject(ideaSubject, ideaAudience);
      if (Array.isArray(newIdeas) && newIdeas.length > 0) {
        setIdeas(newIdeas);
      } else {
        setIdeaError("The AI couldn't come up with ideas for that subject. Try something else!");
      }
    } catch (err: any) {
      console.error("Failed to generate ideas:", err);
      setIdeaError(err.message || "An unexpected error occurred while generating ideas.");
    } finally {
      setIsIdeasLoading(false);
    }
  };

  const handleGenerateTrendingIdeas = async () => {
    setIsIdeasLoading(true);
    setIdeas([]);
    setTrendingSources([]);
    setIdeaError(null);
    try {
      const { ideas: newIdeas, sources } = await generateTrendingAdIdeas();
      if (Array.isArray(newIdeas) && newIdeas.length > 0) {
        setIdeas(newIdeas);
        setTrendingSources(sources);
      } else {
        setIdeaError("The AI didn't find any timely ideas. Try again later!");
      }
    } catch (err: any) {
        console.error("Failed to generate trending ideas:", err);
        setIdeaError(err.message || "An unexpected error occurred while fetching trending ideas.");
    } finally {
        setIsIdeasLoading(false);
    }
  };
  
  const handleEnhancePrompt = async () => {
    if (!adCreative.prompt) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const enhanced = await enhancePrompt(adCreative.prompt, adCreative.targetAudience);
      setAdCreative(prev => ({ ...prev, prompt: enhanced }));
    } catch (err: any) {
      setEnhanceError(err.message || "Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!adCreative.prompt) return;
    navigator.clipboard.writeText(adCreative.prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleClearAll = () => {
    setAdCreative({
      prompt: '',
      adCopy: '',
      aspectRatio: AspectRatio.SQUARE,
      artisticStyle: ArtisticStyle.PHOTOREALISTIC,
      numberOfImages: 1,
      platform: Platform.INSTAGRAM,
      outputType: OutputType.IMAGE,
      targetAudience: TargetAudience.MILLENNIALS,
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
            <div className="flex items-center gap-2">
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
              <button
                onClick={handleCopyPrompt}
                disabled={!adCreative.prompt}
                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                {isCopied ? (
                  'Copied!'
                ) : (
                  <>
                    <ClipboardIcon className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            {enhanceError && <p className="mt-1 text-xs text-red-600">{enhanceError}</p>}
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label htmlFor="idea-subject" className="block text-sm font-semibold text-slate-700">Get AI-Powered Inspiration</label>
              <p className="text-xs text-slate-500 mt-1">Generate concepts from a subject, or get ideas based on current trends.</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-2">
                  <input
                      id="idea-subject"
                      type="text"
                      value={ideaSubject}
                      onChange={(e) => setIdeaSubject(e.target.value)}
                      placeholder="e.g., Humorous auto insurance ideas"
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                  />
                   <select
                        value={ideaAudience}
                        onChange={(e) => setIdeaAudience(e.target.value as TargetAudience)}
                        className="w-full sm:w-auto p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm bg-white"
                    >
                        {Object.values(TargetAudience).map(audience => (
                            <option key={audience} value={audience}>{audience.split(' ')[0]}</option>
                        ))}
                    </select>
                  <button
                      onClick={handleGenerateIdeas}
                      disabled={isIdeasLoading || !ideaSubject}
                      className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-3 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                      {isIdeasLoading ? (
                          <RefreshIcon className="w-4 h-4 animate-spin" />
                      ) : (
                          <SparklesIcon className="w-4 h-4" />
                      )}
                      <span>Ideas</span>
                  </button>
              </div>
              <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-xs text-slate-400">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <button
                  onClick={handleGenerateTrendingIdeas}
                  disabled={isIdeasLoading}
                  className="w-full flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-semibold py-2 px-3 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                  <TrendingUpIcon className="w-4 h-4" />
                  Suggest Timely Ideas
              </button>
              <div className="mt-3">
                <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerateCopy}
                    onChange={(e) => setAutoGenerateCopy(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Auto-generate ad copy when selecting an idea</span>
                </label>
              </div>
              {isIdeasLoading && (
                  <div className="mt-3 text-center text-sm text-slate-500">
                      Generating creative ideas...
                  </div>
              )}
              {ideaError && !isIdeasLoading && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-800" role="alert">
                  <strong>Oops!</strong> {ideaError}
                </div>
              )}
              {ideas.length > 0 && !isIdeasLoading && (
                  <div className="mt-4 space-y-3">
                      {ideas.map((idea, index) => (
                          <button
                              key={index}
                              onClick={() => handleIdeaClick(idea)}
                              className="w-full text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150"
                          >
                              <p className="text-sm text-slate-700 line-clamp-3">{idea.prompt}</p>
                          </button>
                      ))}
                      {trendingSources.length > 0 && (
                        <div className="pt-3">
                            <h4 className="text-xs font-semibold text-slate-600">Sources:</h4>
                            <ul className="list-disc list-inside text-xs text-slate-500 mt-1 space-y-1">
                                {trendingSources.map((source, i) => (
                                    <li key={i} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600">
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                      )}
                  </div>
              )}
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
            className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:bg-slate-100"
            disabled={isGeneratingAdCopy}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">4. Choose a platform</h2>
          <p className="text-sm text-slate-500 mt-1">Optimize your social media copy for a specific platform.</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.values(Platform) as Platform[]).map((platform) => (
              <button
                key={platform}
                onClick={() => setAdCreative(p => ({...p, platform: platform}))}
                className={`px-3 py-2 border rounded-lg text-center font-semibold transition-colors text-sm ${
                  adCreative.platform === platform ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold text-slate-800">5. Choose your audience</h2>
            <p className="text-sm text-slate-500 mt-1">Tailor the tone and style of your post.</p>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.values(TargetAudience) as TargetAudience[]).map((audience) => (
                    <button
                        key={audience}
                        onClick={() => setAdCreative(p => ({...p, targetAudience: audience}))}
                        className={`px-3 py-2 border rounded-lg text-center font-semibold transition-colors text-sm ${
                        adCreative.targetAudience === audience ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        {audience}
                    </button>
                ))}
            </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">6. Configure output</h2>
          <div className="mt-2 space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">Output Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-lg">
                    <button
                    onClick={() => setAdCreative(p => ({...p, outputType: OutputType.IMAGE}))}
                    className={`px-3 py-2 rounded-md text-center font-semibold transition-all text-sm ${adCreative.outputType === OutputType.IMAGE ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-slate-600'}`}
                    >
                    Image
                    </button>
                    <button
                    onClick={() => setAdCreative(p => ({...p, outputType: OutputType.VIDEO}))}
                    className={`px-3 py-2 rounded-md text-center font-semibold transition-all text-sm ${adCreative.outputType === OutputType.VIDEO ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-slate-600'}`}
                    >
                    Video
                    </button>
                </div>
            </div>
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
             {adCreative.outputType === OutputType.IMAGE && (
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
            )}
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                <button
                onClick={onGenerate}
                disabled={isLoading || isCopyLoading || !adCreative.prompt || isEnhancing}
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
                    {adCreative.outputType === OutputType.IMAGE ? `Generate Image${adCreative.numberOfImages > 1 ? 's' : ''}` : 'Generate Video'}
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
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-300"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-sm">Or</span>
              <div className="flex-grow border-t border-slate-300"></div>
            </div>

            <button
              onClick={onGenerateCopy}
              disabled={isLoading || isCopyLoading || !adCreative.prompt || isEnhancing}
              className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isCopyLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Copy...
                </>
              ) : (
                <>
                  <PencilIcon className="w-5 h-5" />
                  {socialMediaCopy ? 'Re-generate Post Copy' : 'Generate Post Copy'}
                </>
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {copyError && !error && <p className="mt-2 text-sm text-red-600">{copyError}</p>}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;