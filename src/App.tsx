/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PerceptronLab from './components/labs/PerceptronLab';
import NeuralCanvasLab from './components/labs/NeuralCanvasLab';
import GeneticLab from './components/labs/GeneticLab';
import LabAssistant from './components/LabAssistant';
import { LabType } from './types';

export default function App() {
  const [activeLab, setActiveLab] = useState<LabType>('dashboard');

  const renderLab = () => {
    switch (activeLab) {
      case 'dashboard':
        return <Dashboard />;
      case 'perceptron':
        return <PerceptronLab />;
      case 'neural':
        return <NeuralCanvasLab />;
      case 'genetic':
        return <GeneticLab />;
      default:
        return <Dashboard />;
    }
  };

  const getLabContext = () => {
    switch (activeLab) {
      case 'perceptron': return 'The Perceptron and single neuron binary classification';
      case 'neural': return 'Neural network architectures and feedforward activations';
      case 'genetic': return 'Genetic Algorithms and evolutionary computation';
      default: return 'Artificial Intelligence and Machine Learning fundamentals';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-lab-bg text-slate-200">
      {/* Sidebar - fixed width */}
      <Sidebar activeLab={activeLab} onSelect={setActiveLab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 lab-grid-bg opacity-10 pointer-events-none" />
        
        {/* Top Header/Nav (Optional) */}
        <div className="h-14 border-b border-lab-border flex items-center px-8 bg-slate-900/10 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <span className="mono-label">Root</span>
            <span className="text-slate-600">/</span>
            <span className="mono-label text-lab-primary">{activeLab}</span>
          </div>
        </div>

        {/* Dynamic Lab Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {renderLab()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global UI Elements */}
        <LabAssistant context={getLabContext()} />
      </main>
    </div>
  );
}

