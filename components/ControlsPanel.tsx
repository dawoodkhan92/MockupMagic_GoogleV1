import React from 'react';
import type { UploadedImage, CategorizedSuggestions } from '../types';
import { ImageUploader } from './ImageUploader';
import { SparkleIcon, RefreshIcon } from './Icons';

interface ControlsPanelProps {
    uploadedImage: UploadedImage | null;
    setUploadedImage: (image: UploadedImage | null) => void;
    userPrompt: string;
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    enhancePrompt: boolean;
    setEnhancePrompt: (enhance: boolean) => void;
    initialSuggestions: CategorizedSuggestions;
    isFetchingSuggestions: boolean;
    handleFetchInitialSuggestions: () => void;
    handleGenerateClick: () => void;
    isLoading: boolean;
    error: string | null;
    hasGenerated: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = (props) => {
    const {
        uploadedImage,
        setUploadedImage,
        userPrompt,
        setUserPrompt,
        enhancePrompt,
        setEnhancePrompt,
        initialSuggestions,
        isFetchingSuggestions,
        handleFetchInitialSuggestions,
        handleGenerateClick,
        isLoading,
        error,
        hasGenerated
    } = props;

    const canGenerate = uploadedImage && userPrompt.trim().length > 0;
    const generateButtonText = hasGenerated ? 'Generate New Mockup' : 'Generate Mockup';
    
    const handleSuggestionClick = (suggestion: string) => {
        setUserPrompt(prev => (prev.trim() ? prev.trim() + ', ' : '') + suggestion);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1 text-zinc-800">Step 1: Upload Product</h3>
              <p className="text-sm text-zinc-600 mb-3">A <span className="font-semibold">transparent background (PNG)</span> usually gives the best results.</p>
              <ImageUploader onImageUpload={setUploadedImage} uploadedImageName={uploadedImage?.name || null}/>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-zinc-800">Step 2: Describe Scene</h3>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., On a rustic wooden table, next to a steaming coffee cup."
                className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition bg-white"
                rows={3}
              />
              <div className="mt-3 flex items-center">
                  <input
                    id="enhance-prompt"
                    type="checkbox"
                    checked={enhancePrompt}
                    onChange={(e) => setEnhancePrompt(e.target.checked)}
                    className="h-4 w-4 text-zinc-600 border-zinc-300 rounded focus:ring-zinc-500"
                  />
                  <label htmlFor="enhance-prompt" className="ml-2 block text-sm text-zinc-800 font-medium">
                   ✨ Enhance prompt with AI
                  </label>
              </div>

              {Object.keys(initialSuggestions).length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-xs text-zinc-600 font-medium">Need inspiration? Click to build your prompt:</p>
                     <button onClick={handleFetchInitialSuggestions} disabled={isFetchingSuggestions} className="text-zinc-500 hover:text-zinc-800 disabled:text-zinc-300 transition-colors p-1 rounded-full">
                       <RefreshIcon className={`h-4 w-4 ${isFetchingSuggestions ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {Object.entries(initialSuggestions).map(([category, suggestions]) => (
                      <div key={category}>
                          <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{category}</h5>
                          <div className="flex flex-wrap gap-2">
                              {suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="border border-zinc-300 bg-white text-zinc-700 text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                  {suggestion}
                                </button>
                              ))}
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
                <button
                    onClick={handleGenerateClick}
                    disabled={!canGenerate || isLoading}
                    className="w-full bg-zinc-900 text-zinc-50 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                >
                  <SparkleIcon />
                  {isLoading ? 'Generating...' : generateButtonText}
                </button>
            </div>
            {error && <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</div>}
        </div>
    );
};
