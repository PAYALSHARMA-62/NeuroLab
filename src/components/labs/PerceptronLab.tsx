import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Plus, Trash2, Zap, X } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell, ReferenceLine } from 'recharts';
import { TrainingData, PerceptronWeights } from '../../types';

export default function PerceptronLab() {
  const [data, setData] = useState<TrainingData[]>([
    { x: 2, y: 3, label: 1 },
    { x: 3, y: 2, label: 1 },
    { x: -2, y: -3, label: -1 },
    { x: -3, y: -2, label: -1 },
  ]);
  const [weights, setWeights] = useState<PerceptronWeights>({ w1: Math.random() * 2 - 1, w2: Math.random() * 2 - 1, bias: Math.random() * 2 - 1 });
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [iterations, setIterations] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const trainingRef = useRef<NodeJS.Timeout | null>(null);

  const predict = (x: number, y: number, w: PerceptronWeights) => {
    const sum = x * w.w1 + y * w.w2 + w.bias;
    return sum >= 0 ? 1 : -1;
  };

  const trainStep = () => {
    let corrected = false;
    let localWeights = { ...weights };
    let correctCount = 0;

    data.forEach(point => {
      const p = predict(point.x, point.y, localWeights);
      if (p !== point.label) {
        const error = point.label - p;
        localWeights.w1 += error * point.x * learningRate;
        localWeights.w2 += error * point.y * learningRate;
        localWeights.bias += error * learningRate;
        corrected = true;
      } else {
        correctCount++;
      }
    });

    setWeights(localWeights);
    setAccuracy((correctCount / data.length) * 100);
    setIterations(prev => prev + 1);

    if (!corrected) {
      setIsTraining(false);
    }
  };

  useEffect(() => {
    if (isTraining) {
      trainingRef.current = setInterval(trainStep, 100);
    } else {
      if (trainingRef.current) clearInterval(trainingRef.current);
    }
    return () => { if (trainingRef.current) clearInterval(trainingRef.current); };
  }, [isTraining, weights, data]);

  const addPoint = (label: 1 | -1) => {
    const x = (Math.random() * 10 - 5);
    const y = (Math.random() * 10 - 5);
    setData([...data, { x, y, label }]);
    setIsTraining(false);
    setIterations(0);
  };

  const reset = () => {
    setIsTraining(false);
    setIterations(0);
    setWeights({ w1: Math.random() * 2 - 1, w2: Math.random() * 2 - 1, bias: Math.random() * 2 - 1 });
    setAccuracy(0);
  };

  // Calculate line point for visualization
  // w1*x + w2*y + b = 0 => y = (-w1*x - b) / w2
  const getLineData = () => {
    if (Math.abs(weights.w2) < 0.001) return []; // Vertical line case simplified
    const x1 = -10;
    const y1 = (-weights.w1 * x1 - weights.bias) / weights.w2;
    const x2 = 10;
    const y2 = (-weights.w1 * x2 - weights.bias) / weights.w2;
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  };

  return (
    <div id="perceptron-lab-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div id="perceptron-viz-card" className="glass-panel rounded-2xl p-6 flex-1 min-h-[400px] relative">
          <div className="absolute top-4 left-6 z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Decision Space
            </h2>
            <p className="text-xs text-slate-400 font-mono">SUPERVISED LEARNING SIMULATION</p>
          </div>

          <div id="perceptron-chart-container" className="absolute inset-0 pt-16 px-6">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" domain={[-10, 10]} hide />
                <YAxis type="number" dataKey="y" domain={[-10, 10]} hide />
                <ZAxis type="number" range={[100, 100]} />
                
                {/* Decision Line */}
                <Scatter data={getLineData()} line={{ stroke: '#38bdf8', strokeWidth: 2 }} shape={() => null} />
                
                <Scatter name="Points" data={data} shape="circle">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.label === 1 ? '#f472b6' : '#22d3ee'} />
                  ))}
                </Scatter>
                
                <ReferenceLine x={0} stroke="#334155" />
                <ReferenceLine y={0} stroke="#334155" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div id="perceptron-stats-card" className="glass-panel rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="mono-label">Iterations</p>
            <p id="stat-iterations" className="text-2xl font-bold font-mono">{iterations}</p>
          </div>
          <div className="space-y-1">
            <p className="mono-label">Accuracy</p>
            <p id="stat-accuracy" className="text-2xl font-bold font-mono">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="mono-label">W1 Weight</p>
            <p id="stat-w1" className="text-sm font-mono text-lab-primary">{weights.w1.toFixed(3)}</p>
          </div>
          <div className="space-y-1">
            <p className="mono-label">W2 Weight</p>
            <p id="stat-w2" className="text-sm font-mono text-lab-accent">{weights.w2.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div id="perceptron-controls-card" className="glass-panel rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b border-lab-border pb-2">Lab Controls</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                id="perceptron-toggle-training"
                onClick={() => setIsTraining(!isTraining)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  isTraining ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-lab-primary text-lab-bg hover:bg-lab-secondary'
                }`}
              >
                {isTraining ? <><X className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start Training</>}
              </button>
              <button
                id="perceptron-reset"
                onClick={reset}
                className="p-3 glass-panel rounded-xl hover:bg-lab-border transition-colors"
                title="Reset Weights"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="perceptron-add-a"
                onClick={() => addPoint(1)}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20"
              >
                <Plus className="w-4 h-4" /> Class A
              </button>
              <button
                id="perceptron-add-b"
                onClick={() => addPoint(-1)}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
              >
                <Plus className="w-4 h-4" /> Class B
              </button>
            </div>

            <button
                id="perceptron-clear"
                onClick={() => setData([])}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear Canvas
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-lab-border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="learning-rate-slider" className="mono-label">Learning Rate</label>
                <span className="text-xs font-mono text-lab-primary">{learningRate}</span>
              </div>
              <input
                id="learning-rate-slider"
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-lab-primary"
              />
            </div>
          </div>
        </div>

        <div id="perceptron-briefing" className="glass-panel rounded-2xl p-6">
          <h4 className="font-medium text-sm text-slate-300">Lab Briefing</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The Perceptron is the simplest form of a neural network used for binary classification. 
            It learns a linear decision boundary. Add points of different classes and watch 
            how it adjusts its weights to separate them.
          </p>
        </div>
      </div>
    </div>
  );
}
