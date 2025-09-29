

import React, { useRef, useState, useEffect } from 'react';
import { AdCreative, SocialMediaCopy } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import ShareIcon from './icons/ShareIcon';
import FilmIcon from './icons/FilmIcon';
import UndoIcon from './icons/UndoIcon';
import PencilIcon from './icons/PencilIcon';
import { generateSpriteSheet } from '../services/geminiService';

declare var gifshot: any;

interface ImageCanvasProps {
  adCreative: AdCreative;
  generatedImages: string[];
  isLoading: boolean;
  onGenerateCopy: () => void;
  socialMediaCopy: SocialMediaCopy | null;
  isCopyLoading: boolean;
  copyError: string | null;
  onStartOver: () => void;
  onEditImage: (editPrompt: string) => void;
  isEditing: boolean;
  selectedImageIndex: number | null;
  onSelectImage: (index: number) => void;
}

const drawText = (ctx: CanvasRenderingContext2D, text: string, canvasWidth: number, canvasHeight: number) => {
    const padding = canvasWidth * 0.05;
    const maxWidth = canvasWidth - padding * 2;
    
    ctx.font = `bold ${canvasWidth * 0.07}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    const lineHeight = canvasWidth * 0.08;
    const totalTextHeight = lines.length * lineHeight;
    let y = canvasHeight - padding - totalTextHeight + lineHeight;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 6;
    
    for (const l of lines) {
        ctx.strokeText(l.trim(), canvasWidth / 2, y);
        y += lineHeight;
    }
    
    y = canvasHeight - padding - totalTextHeight + lineHeight;
    ctx.fillStyle = 'white';

    for (const l of lines) {
        ctx.fillText(l.trim(), canvasWidth / 2, y);
        y += lineHeight;
    }
};

interface SlicedSpriteSheet {
    frames: string[];
    frameWidth: number;
    frameHeight: number;
}

const SocialCopyBlock: React.FC<{ copy: SocialMediaCopy }> = ({ copy }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        const textToCopy = `${copy.caption}\n\n${copy.emojis}\n\n${copy.hashtags}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    return (
        <div className="space-y-3 relative">
            <div>
                <p className="text-slate-800 whitespace-pre-wrap">{copy.caption}</p>
                <p className="mt-2 text-slate-800">{copy.emojis}</p>
                <p className="mt-2 text-sm text-indigo-600 font-medium whitespace-pre-wrap break-words">{copy.hashtags}</p>
            </div>
            <button
                onClick={handleCopy}
                className="absolute -top-2 -right-2 flex items-center justify-center gap-1.5 bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-full hover:bg-slate-300 transition-colors text-xs"
            >
                {isCopied ? 'Copied!' : <><ClipboardIcon className="w-3 h-3" /> Copy</>}
            </button>
        </div>
    );
};


const ImageCanvas: React.FC<ImageCanvasProps> = ({ 
    adCreative, 
    generatedImages, 
    isLoading,
    onGenerateCopy,
    socialMediaCopy,
    isCopyLoading,
    copyError,
    onStartOver,
    onEditImage,
    isEditing,
    selectedImageIndex,
    onSelectImage,
 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canShare, setCanShare] = useState(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifDataUrl, setGifDataUrl] = useState<string | null>(null);
  const [gifError, setGifError] = useState<string | null>(null);
  const [showAnimationControls, setShowAnimationControls] = useState(false);
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [showEditControls, setShowEditControls] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  const selectedImage = selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null;

  useEffect(() => {
    if (navigator.share && typeof navigator.canShare === 'function') {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    setGifDataUrl(null);
    setGifError(null);
    setIsGeneratingGif(false);
    setShowAnimationControls(false);
    setAnimationPrompt('');
    setShowEditControls(false);
    setEditPrompt('');
  }, [generatedImages]);

  const downloadFile = (href: string, downloadName: string) => {
    const link = document.createElement('a');
    link.download = downloadName;
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadImage = () => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;
    img.onload = () => {
      const isVertical = adCreative.aspectRatio === "9:16";
      canvas.width = 1080;
      canvas.height = isVertical ? 1920 : 1080;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      if(adCreative.adCopy) {
        drawText(ctx, adCreative.adCopy, canvas.width, canvas.height);
      }
      
      downloadFile(canvas.toDataURL('image/png'), 'ai-social-ad.png');
    };
  };

  const handleDownloadGif = () => {
    if (!gifDataUrl) return;
    downloadFile(gifDataUrl, 'ai-animated-ad.gif');
  };
  
  const handleShare = async () => {
    if (!selectedImage || !canvasRef.current || !canShare) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;
    img.onload = () => {
        const isVertical = adCreative.aspectRatio === "9:16";
        canvas.width = 1080;
        canvas.height = isVertical ? 1920 : 1080;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if(adCreative.adCopy) {
            drawText(ctx, adCreative.adCopy, canvas.width, canvas.height);
        }

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], 'ai-social-ad.png', { type: 'image/png' });
            const shareData = {
                files: [file],
                title: 'AI Generated Social Ad',
                text: socialMediaCopy?.caption || adCreative.adCopy || 'Check out this ad I created!',
            };

            if (navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (error) {
                    console.error('Sharing failed:', error);
                }
            } else {
                console.log("Sharing not supported for this data.");
            }
        }, 'image/png');
    };
  };

  const sliceSpriteSheet = (spriteSheetSrc: string, adCopy: string): Promise<SlicedSpriteSheet> => {
    return new Promise((resolve, reject) => {
        const frames: string[] = [];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = spriteSheetSrc;
        img.onload = () => {
            if (img.width === 0 || img.height === 0) {
                return reject(new Error("Sprite sheet image has zero dimensions."));
            }
            const frameWidth = Math.floor(img.width / 3);
            const frameHeight = Math.floor(img.height / 3);

            if (frameWidth === 0 || frameHeight === 0) {
                return reject(new Error("Calculated frame dimensions are zero. Sprite sheet may be too small."));
            }

            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = frameWidth;
                    canvas.height = frameHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                       console.error("Could not get canvas context for slicing a frame.");
                       continue;
                    }

                    ctx.drawImage(
                        img,
                        col * frameWidth,
                        row * frameHeight,
                        frameWidth,
                        frameHeight,
                        0,
                        0,
                        frameWidth,
                        frameHeight
                    );

                    if (adCopy) {
                        drawText(ctx, adCopy, frameWidth, frameHeight);
                    }
                    
                    frames.push(canvas.toDataURL('image/png'));
                }
            }
             if (frames.length < 9) {
                return reject(new Error("Failed to generate all animation frames."));
            }
            resolve({ frames, frameWidth, frameHeight });
        };
        img.onerror = () => {
            reject(new Error("Failed to load sprite sheet image."));
        };
    });
  };

  const handleShowEditControls = () => {
    setShowEditControls(true);
    setShowAnimationControls(false); 
  };

  const handleGenerateEdit = () => {
    if (!editPrompt) return;
    onEditImage(editPrompt);
  };

  const handleShowAnimationControls = () => {
    setShowAnimationControls(true);
    setShowEditControls(false); 
    setAnimationPrompt(adCreative.prompt); 
  };
  
  const handleGenerateAnimation = async () => {
    if (!selectedImage || !animationPrompt) return;
    setIsGeneratingGif(true);
    setGifError(null);
    setGifDataUrl(null);
    setShowAnimationControls(false);

    try {
        const { spriteSheet, frameDuration } = await generateSpriteSheet(selectedImage, animationPrompt);
        const { frames, frameWidth, frameHeight } = await sliceSpriteSheet(spriteSheet, adCreative.adCopy);
        
        gifshot.createGIF({
          images: frames,
          gifWidth: frameWidth,
          gifHeight: frameHeight,
          frameDuration: frameDuration / 1000,
          numFrames: frames.length,
          text: '',
          fontSize: '0px',
        }, (obj: { error: boolean; errorCode: string; errorMsg: string; image: string }) => {
          setIsGeneratingGif(false);
          if (!obj.error) {
            setGifDataUrl(obj.image);
          } else {
            console.error('GIF creation failed:', obj.errorMsg);
            setGifError('Sorry, the GIF creation failed.');
          }
        });
    } catch (err: any) {
        setGifError(err.message || 'An unknown error occurred during GIF generation.');
        setIsGeneratingGif(false);
    }
  };

  const isVertical = adCreative.aspectRatio === "9:16";
  const displaySrc = selectedImage;
  const showOverallLoader = isLoading || isEditing;
  const loaderText = isEditing ? 'Applying your edits...' : 'Generating your masterpiece...';

  return (
    <div className="p-6 bg-slate-100 rounded-xl flex flex-col items-center justify-start h-full overflow-y-auto">
      <div 
        className={`relative w-full overflow-hidden bg-slate-200 rounded-lg shadow-inner transition-all duration-300 ${isVertical ? 'aspect-[9/16]' : 'aspect-square max-w-full'}`}
        style={{ maxWidth: isVertical ? '360px' : '100%' }}
      >
        {showOverallLoader && (
          <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center z-10">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white mt-4 font-semibold">{loaderText}</p>
          </div>
        )}
        {!displaySrc && !showOverallLoader && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              <p className="mt-2 font-medium">Your generated image will appear here</p>
            </div>
          </div>
        )}
        {displaySrc && (
          <>
            <img src={gifDataUrl || displaySrc} alt="Generated ad creative" className="w-full h-full object-cover" />
            {!gifDataUrl && adCreative.adCopy && (
                <div 
                    className="absolute bottom-0 left-0 right-0 p-[5%] pointer-events-none"
                    style={{
                        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                    }}
                >
                    <p 
                        className="text-white text-center leading-tight break-words"
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: isVertical ? '8cqw' : '7cqi',
                            fontWeight: 700,
                        }}
                    >
                        {adCreative.adCopy}
                    </p>
                </div>
            )}
          </>
        )}
      </div>

      {generatedImages.length > 1 && !showOverallLoader && (
        <div className="mt-4 w-full" style={{ maxWidth: isVertical ? '360px' : '100%' }}>
            <p className="text-sm font-semibold text-slate-700 mb-2">Select a variation:</p>
            <div className="grid grid-cols-4 gap-2">
                {generatedImages.map((image, index) => (
                    <button 
                        key={index}
                        onClick={() => onSelectImage(index)}
                        className={`aspect-square rounded-md overflow-hidden transition-all duration-200 ${selectedImageIndex === index ? 'ring-4 ring-indigo-500' : 'ring-2 ring-transparent hover:ring-indigo-400'}`}
                    >
                        <img src={image} alt={`Variation ${index + 1}`} className="w-full h-full object-cover"/>
                    </button>
                ))}
            </div>
        </div>
      )}

      {selectedImage && (
        <div className="mt-6 w-full flex flex-col items-center space-y-4" style={{ maxWidth: isVertical ? '360px' : '100%' }}>
            <button
                onClick={onStartOver}
                className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
            >
                <UndoIcon className="w-5 h-5" />
                Start Over
            </button>
            <div className="w-full grid grid-cols-2 gap-4">
                <button
                    onClick={handleDownloadImage}
                    disabled={showOverallLoader}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 transition-all shadow-md"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download Image
                </button>
                <button
                    onClick={handleShowEditControls}
                    disabled={showOverallLoader || isGeneratingGif}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 transition-all shadow-md"
                >
                    <PencilIcon className="w-5 h-5" />
                    Edit with AI
                </button>
            </div>
            
            {showEditControls && (
                <div className="w-full p-4 bg-white/60 rounded-lg shadow-sm space-y-3">
                    <label htmlFor="editPrompt" className="block text-sm font-semibold text-slate-800">
                        Describe your edit:
                    </label>
                    <textarea
                        id="editPrompt"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., add a party hat on the robot"
                        className="w-full h-24 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEditControls(false)}
                            className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerateEdit}
                            disabled={!editPrompt || showOverallLoader}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Apply Edit
                        </button>
                    </div>
                </div>
            )}

            <div className='w-full'>
              {gifDataUrl ? (
                      <button
                          onClick={handleDownloadGif}
                          className="w-full flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md"
                      >
                          <DownloadIcon className="w-5 h-5" />
                          Download GIF
                      </button>
                  ) : (
                      <button
                          onClick={handleShowAnimationControls}
                          disabled={isGeneratingGif || showOverallLoader}
                          className="w-full flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all shadow-md"
                      >
                          {isGeneratingGif ? (
                              <>
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Creating...
                              </>
                          ) : (
                            <>
                              <FilmIcon className="w-5 h-5" />
                              Create GIF
                            </>
                          )}
                      </button>
                  )}
            </div>

            {showAnimationControls && (
                <div className="w-full p-4 bg-white/60 rounded-lg shadow-sm space-y-3">
                    <label htmlFor="animationPrompt" className="block text-sm font-semibold text-slate-800">
                        Describe the animation:
                    </label>
                    <textarea
                        id="animationPrompt"
                        value={animationPrompt}
                        onChange={(e) => setAnimationPrompt(e.target.value)}
                        placeholder="e.g., Make the person apply the band-aid in a looping motion."
                        className="w-full h-24 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAnimationControls(false)}
                            className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerateAnimation}
                            disabled={!animationPrompt}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Generate Animation
                        </button>
                    </div>
                </div>
            )}
            
            {gifError && <p className="mt-2 w-full text-center text-sm text-red-600">{gifError}</p>}
            
            <div className="w-full p-4 bg-white/60 rounded-lg shadow-sm space-y-4">
                {!socialMediaCopy && !isCopyLoading && (
                    <button
                        onClick={onGenerateCopy}
                        disabled={isCopyLoading || showOverallLoader}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Generate Post Caption
                    </button>
                )}

                {isCopyLoading && (
                    <div className="flex items-center justify-center p-3">
                         <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="ml-3 text-slate-600 font-medium">Crafting your post...</p>
                    </div>
                )}

                {copyError && <p className="text-sm text-red-600 text-center">{copyError}</p>}
                
                {socialMediaCopy && <SocialCopyBlock copy={socialMediaCopy} />}
            </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCanvas;