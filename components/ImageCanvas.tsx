
import React, { useRef, useState } from 'react';
import { AdCreative, SocialMediaCopy } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';

interface ImageCanvasProps {
  adCreative: AdCreative;
  generatedImage: string | null;
  isLoading: boolean;
  onGenerateCopy: () => void;
  socialMediaCopy: SocialMediaCopy | null;
  isCopyLoading: boolean;
  copyError: string | null;
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

const ImageCanvas: React.FC<ImageCanvasProps> = ({ 
    adCreative, 
    generatedImage, 
    isLoading,
    onGenerateCopy,
    socialMediaCopy,
    isCopyLoading,
    copyError
 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = () => {
    if (!generatedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = generatedImage;
    img.onload = () => {
      const isVertical = adCreative.aspectRatio === "9:16";
      canvas.width = 1080;
      canvas.height = isVertical ? 1920 : 1080;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      if(adCreative.adCopy) {
        drawText(ctx, adCreative.adCopy, canvas.width, canvas.height);
      }
      
      const link = document.createElement('a');
      link.download = 'ai-social-ad.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const handleCopy = () => {
    if (!socialMediaCopy) return;
    const textToCopy = `${socialMediaCopy.caption}\n\n${socialMediaCopy.emojis}\n\n${socialMediaCopy.hashtags}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const isVertical = adCreative.aspectRatio === "9:16";

  return (
    <div className="p-6 bg-slate-100 rounded-xl flex flex-col items-center justify-center h-full">
      <div 
        className={`relative w-full overflow-hidden bg-slate-200 rounded-lg shadow-inner transition-all duration-300 ${isVertical ? 'aspect-[9/16] max-h-full' : 'aspect-square max-w-full'}`}
        style={{ maxWidth: isVertical ? '360px' : '100%' }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center z-10">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white mt-4 font-semibold">Generating your masterpiece...</p>
          </div>
        )}
        {!generatedImage && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              <p className="mt-2 font-medium">Your generated image will appear here</p>
            </div>
          </div>
        )}
        {generatedImage && (
          <>
            <img src={generatedImage} alt="Generated ad creative" className="w-full h-full object-cover" />
            {adCreative.adCopy && (
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
      {generatedImage && (
        <div className="mt-6 w-full flex flex-col items-center space-y-4" style={{ maxWidth: isVertical ? '360px' : '100%' }}>
            <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 transition-all shadow-md"
            >
                <DownloadIcon className="w-5 h-5" />
                Download Image
            </button>
            
            <div className="w-full p-4 bg-white/60 rounded-lg shadow-sm">
                {!socialMediaCopy && !isCopyLoading && (
                    <button
                        onClick={onGenerateCopy}
                        disabled={isCopyLoading}
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
                
                {socialMediaCopy && (
                    <div className="space-y-3 relative">
                        <div>
                            <p className="text-slate-800 whitespace-pre-wrap">{socialMediaCopy.caption}</p>
                            <p className="mt-2 text-slate-800">{socialMediaCopy.emojis}</p>
                            <p className="mt-2 text-sm text-indigo-600 font-medium whitespace-pre-wrap break-words">{socialMediaCopy.hashtags}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="absolute -top-2 -right-2 flex items-center justify-center gap-1.5 bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-full hover:bg-slate-300 transition-colors text-xs"
                        >
                            {isCopied ? 'Copied!' : <><ClipboardIcon className="w-3 h-3" /> Copy</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCanvas;
