import React, { useState, useEffect } from 'react';
import type { UploadedImage, CategorizedSuggestions } from '../types';
import { LoadingOverlay } from './LoadingOverlay';
import { MagicWandIcon, DownloadIcon, UndoIcon, RedoIcon } from './Icons';

interface DisplayPanelProps {
    isLoading: boolean;
    generatedImage: string | null;
    uploadedImage: UploadedImage | null;
    finalPromptForDisplay: string | null;
    handleRerunPrompt: (prompt: string) => void;
    customRefinementPrompt: string;
    setCustomRefinementPrompt: React.Dispatch<React.SetStateAction<string>>;
    handleRefinement: (prompt: string) => void;
    canUndo: boolean;
    handleUndoClick: () => void;
    canRedo: boolean;
    handleRedoClick: () => void;
    suggestedRefinements: CategorizedSuggestions;
}

const ImageDisplay: React.FC<{
    generatedImage: string | null;
}> = ({ generatedImage }) => {
    
    if (!generatedImage) {
        return (
            <div className="text-center text-zinc-500">
                <MagicWandIcon />
                <p className="mt-2">Your mockup will appear here.</p>
            </div>
        );
    }

    return (
        <img
            src={`data:image/webp;base64,${generatedImage}`}
            alt="Generated product mockup"
            className="max-w-full max-h-full object-contain rounded-md shadow-md"
        />
    );
};


export const DisplayPanel: React.FC<DisplayPanelProps> = (props) => {
    const {
        isLoading,
        generatedImage,
        finalPromptForDisplay,
        handleRerunPrompt,
        customRefinementPrompt,
        setCustomRefinementPrompt,
        handleRefinement,
        canUndo,
        handleUndoClick,
        canRedo,
        handleRedoClick,
        suggestedRefinements
    } = props;
    
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState('');
    
    const isRefinementPrompt = finalPromptForDisplay?.startsWith('Refinement:');

    useEffect(() => {
        if (finalPromptForDisplay) {
            setEditedPrompt(finalPromptForDisplay);
            setIsEditingPrompt(false); 
        }
    }, [finalPromptForDisplay]);

    const handleRegenerateClick = () => {
        handleRerunPrompt(editedPrompt);
        setIsEditingPrompt(false);
    };
    
    const handleCancelEditClick = () => {
        setIsEditingPrompt(false);
        if(finalPromptForDisplay) {
            setEditedPrompt(finalPromptForDisplay);
        }
    }
    
    const handleSuggestionClick = (suggestion: string) => {
        setCustomRefinementPrompt(prev => (prev.trim() ? prev.trim() + ', ' : '') + suggestion);
    };
    
    const handleDownloadClick = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.download = `mockup-magic-${Date.now()}.png`;
            link.href = `data:image/webp;base64,${generatedImage}`;
            link.click();
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-xl flex flex-col overflow-hidden">
            <div className="relative w-full h-full bg-zinc-100 flex items-center justify-center p-6 aspect-square">
              <LoadingOverlay isLoading={isLoading} />
              <ImageDisplay generatedImage={generatedImage} />
            </div>

            {generatedImage && !isLoading && (
              <div className="flex flex-col gap-4 p-6 bg-zinc-900">
                {finalPromptForDisplay && (
                  <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-bold text-zinc-100">Final Prompt</h4>
                        {!isEditingPrompt && !isRefinementPrompt && (
                            <button 
                                onClick={() => setIsEditingPrompt(true)}
                                className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                            >
                                Edit Prompt
                            </button>
                        )}
                    </div>

                    {isEditingPrompt ? (
                        <>
                            <textarea
                                value={editedPrompt}
                                onChange={(e) => setEditedPrompt(e.target.value)}
                                className="w-full p-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-zinc-400 transition bg-zinc-900 text-zinc-100 text-sm"
                                rows={4}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={handleRegenerateClick}
                                    disabled={isLoading || !editedPrompt.trim()}
                                    className="flex-grow bg-zinc-100 text-zinc-900 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-zinc-500 disabled:text-zinc-300 disabled:cursor-not-allowed hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                                >
                                    Regenerate with this Prompt
                                </button>
                                <button
                                    onClick={handleCancelEditClick}
                                    className="flex-shrink-0 border border-zinc-600 bg-transparent text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-300 p-3 rounded-md">
                            {finalPromptForDisplay}
                        </p>
                    )}
                  </div>
                )}
                
                <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800">
                  <h4 className="text-md font-bold mb-2 text-zinc-100">Refine Scene</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customRefinementPrompt}
                      onChange={(e) => setCustomRefinementPrompt(e.target.value)}
                      placeholder="e.g., Make the lighting more dramatic"
                      className="w-full p-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-zinc-400 transition bg-zinc-900 text-white"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRefinement(customRefinementPrompt)}}
                    />
                    <button
                      onClick={() => handleRefinement(customRefinementPrompt)}
                      disabled={!customRefinementPrompt.trim()}
                      className="bg-zinc-100 text-zinc-900 font-semibold px-4 py-2 rounded-md transition-colors hover:bg-white disabled:bg-zinc-500 disabled:text-zinc-300 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Refine image"
                    >
                      Refine
                    </button>
                    <button
                      onClick={handleUndoClick}
                      disabled={!canUndo}
                      className="border border-zinc-600 bg-transparent text-zinc-300 p-2 rounded-md transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Undo last refinement"
                    >
                      <UndoIcon />
                    </button>
                    <button
                      onClick={handleRedoClick}
                      disabled={!canRedo}
                      className="border border-zinc-600 bg-transparent text-zinc-300 p-2 rounded-md transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Redo refinement"
                    >
                      <RedoIcon />
                    </button>
                  </div>
                  {Object.keys(suggestedRefinements).length > 0 && (
                     <div className="mt-4 flex flex-col gap-3">
                        <p className="text-xs text-zinc-400 font-medium -mb-1">Need ideas? Click to add to your refinement:</p>
                        {Object.entries(suggestedRefinements).map(([category, suggestions]) => (
                          <div key={category}>
                              <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{category}</h5>
                              <div className="flex flex-wrap gap-2">
                                  {suggestions.map((suggestion, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="border border-zinc-600 bg-zinc-700 text-zinc-200 text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-zinc-600 hover:text-white"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                              </div>
                          </div>
                        ))}
                      </div>
                  )}
                </div>

                <button
                    onClick={handleDownloadClick}
                    className="w-full bg-zinc-100 text-zinc-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                >
                    <DownloadIcon/>
                    Download Image
                </button>
              </div>
            )}
        </div>
    );
};