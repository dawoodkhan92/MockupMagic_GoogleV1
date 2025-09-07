import React from 'react';
import { MagicWandIcon } from './Icons';

export const Header: React.FC = () => (
    <header className="bg-white border-b border-zinc-200">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <MagicWandIcon />
          <h1 className="text-2xl font-bold ml-2">MockupMagic</h1>
          <span className="ml-3 text-xs font-semibold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full">Guided Edition</span>
        </div>
    </header>
);