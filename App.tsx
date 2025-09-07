import React, { useState, useCallback, useEffect } from 'react';
import type { UploadedImage, CategorizedSuggestions, GenerationResult } from './types';
import { generateFusedMockup, enhanceUserPrompt, generateRefinementSuggestions, generateInitialPromptSuggestions, editGeneratedMockup } from './services/geminiService';

// Import modular components
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { DisplayPanel } from './components/DisplayPanel';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [enhancePrompt, setEnhancePrompt] = useState<boolean>(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | null>(null);
  const [finalPromptForDisplay, setFinalPromptForDisplay] = useState<string | null>(null);
  
  // Suggestions State
  const [initialSuggestions, setInitialSuggestions] = useState<CategorizedSuggestions>({});
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  const [suggestedRefinements, setSuggestedRefinements] = useState<CategorizedSuggestions>({});
  
  // History State
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Refinement State
  const [customRefinementPrompt, setCustomRefinementPrompt] = useState('');

  const handleFetchInitialSuggestions = useCallback(async () => {
    setIsFetchingSuggestions(true);
    const suggestions = await generateInitialPromptSuggestions();
    setInitialSuggestions(suggestions);
    setIsFetchingSuggestions(false);
  }, []);

  useEffect(() => {
    handleFetchInitialSuggestions();
  }, [handleFetchInitialSuggestions]);

  useEffect(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
        const currentResult = history[historyIndex];
        setGeneratedImage(currentResult.image);
        setFinalPromptForDisplay(currentResult.prompt);
    } else if (historyIndex === -1) {
        setGeneratedImage(null);
        setFinalPromptForDisplay(null);
    }
  }, [historyIndex, history]);

  const addResultToState = useCallback((image: string, prompt: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ image, prompt });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLastUsedPrompt(prompt);
    generateRefinementSuggestions(prompt).then(setSuggestedRefinements);
  }, [history, historyIndex]);

  const handleGeneration = useCallback(async (prompt: string, imageToUse: UploadedImage) => {
    setIsLoading(true);
    setError(null);
    setSuggestedRefinements({});

    try {
      const result = await generateFusedMockup(prompt, imageToUse);
      addResultToState(result, prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [addResultToState]);
  
  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage || !userPrompt) {
      setError('Please upload an image and describe your vision first.');
      return;
    }

    setHistory([]);
    setHistoryIndex(-1);
    setFinalPromptForDisplay(null);
    
    setIsLoading(true);
    let finalPrompt = userPrompt;
    if (enhancePrompt) {
        finalPrompt = await enhanceUserPrompt(userPrompt);
    }
    setIsLoading(false);

    handleGeneration(finalPrompt, uploadedImage);
  }, [uploadedImage, userPrompt, enhancePrompt, handleGeneration]);

  const handleRefinement = useCallback(async (refinementText: string) => {
    if(!refinementText.trim()) {
        setError("Please enter a refinement instruction.");
        return;
    }
    const lastResult = history[historyIndex];
    if (!lastResult) {
        setError("Cannot refine without a previously generated image.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestedRefinements({});

    const lastImageAsUploaded: UploadedImage = {
        base64: lastResult.image,
        mimeType: 'image/png',
        name: `refinement-source.png`
    };

    try {
      const result = await editGeneratedMockup(refinementText, lastImageAsUploaded);
      
      const newPromptForDisplay = `Refinement: "${refinementText}"`;
      addResultToState(result, newPromptForDisplay);
      
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
        setCustomRefinementPrompt('');
    }
  }, [history, historyIndex, addResultToState]);


  const handleRerunPrompt = useCallback(async (newPrompt: string) => {
    if (!uploadedImage) {
      setError('Cannot regenerate without the original uploaded image.');
      return;
    }
    if (!newPrompt.trim()) {
      setError('Please enter a prompt to regenerate.');
      return;
    }
    
    // Reset history for this new creative path
    setHistory([]);
    setHistoryIndex(-1);
    
    // Call the core generation logic
    handleGeneration(newPrompt, uploadedImage);
  }, [uploadedImage, handleGeneration]);


  const handleUndoClick = useCallback(() => {
    if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const handleRedoClick = useCallback(() => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history]);

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-2">Instant Professional Product Photos</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">Upload your product, describe a scene, and let our AI generate studio-quality mockups in seconds.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlsPanel
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            enhancePrompt={enhancePrompt}
            setEnhancePrompt={setEnhancePrompt}
            initialSuggestions={initialSuggestions}
            isFetchingSuggestions={isFetchingSuggestions}
            handleFetchInitialSuggestions={handleFetchInitialSuggestions}
            handleGenerateClick={handleGenerateClick}
            isLoading={isLoading}
            error={error}
            hasGenerated={history.length > 0}
          />
          <DisplayPanel
            isLoading={isLoading}
            generatedImage={generatedImage}
            uploadedImage={uploadedImage}
            finalPromptForDisplay={finalPromptForDisplay}
            handleRerunPrompt={handleRerunPrompt}
            customRefinementPrompt={customRefinementPrompt}
            setCustomRefinementPrompt={setCustomRefinementPrompt}
            handleRefinement={handleRefinement}
            canUndo={historyIndex > 0}
            handleUndoClick={handleUndoClick}
            canRedo={historyIndex < history.length - 1}
            handleRedoClick={handleRedoClick}
            suggestedRefinements={suggestedRefinements}
          />
        </div>
      </main>
    </div>
  );
}
