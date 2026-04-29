import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Dna, Play, RotateCcw, Target, Users } from 'lucide-react';

interface GeneticAgent {
  id: number;
  dna: string[]; // sequence of moves: 'U', 'D', 'L', 'R'
  x: number;
  y: number;
  fitness: number;
  isDead: boolean;
  hasFinished: boolean;
}

const GRID_SIZE = 15;
const STEP_LIMIT = 30;
const POP_SIZE = 40;

export default function GeneticLab() {
  const [generation, setGeneration] = useState(1);
  const [population, setPopulation] = useState<GeneticAgent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [goal, setGoal] = useState({ x: 12, y: 12 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initPopulation = (parents: GeneticAgent[] = []) => {
    const newPop: GeneticAgent[] = [];
    for (let i = 0; i < POP_SIZE; i++) {
      let dna: string[] = [];
      if (parents.length > 0) {
        // Crossover
        const p1 = parents[Math.floor(Math.random() * parents.length)];
        const p2 = parents[Math.floor(Math.random() * parents.length)];
        const mid = Math.floor(Math.random() * STEP_LIMIT);
        dna = [...p1.dna.slice(0, mid), ...p2.dna.slice(mid)];
        // Mutation
        dna = dna.map(move => Math.random() < 0.05 ? ['U', 'D', 'L', 'R'][Math.floor(Math.random() * 4)] : move);
      } else {
        dna = Array.from({ length: STEP_LIMIT }, () => ['U', 'D', 'L', 'R'][Math.floor(Math.random() * 4)]);
      }

      newPop.push({
        id: i,
        dna,
        x: 2,
        y: 2,
        fitness: 0,
        isDead: false,
        hasFinished: false
      });
    }
    return newPop;
  };

  useEffect(() => {
    setPopulation(initPopulation());
  }, []);

  const calculateFitness = (agent: GeneticAgent) => {
    const dist = Math.sqrt(Math.pow(agent.x - goal.x, 2) + Math.pow(agent.y - goal.y, 2));
    let fitness = (1 / (dist + 1));
    if (agent.hasFinished) fitness *= 2; // Bonus for finishing
    return fitness;
  };

  const nextStep = () => {
    if (currentStep >= STEP_LIMIT) {
      evolve();
      return;
    }

    setPopulation(prev => {
      const updated = prev.map(agent => {
        if (agent.isDead || agent.hasFinished) return agent;
        
        const move = agent.dna[currentStep];
        let nextX = agent.x;
        let nextY = agent.y;

        if (move === 'U') nextY--;
        if (move === 'D') nextY++;
        if (move === 'L') nextX--;
        if (move === 'R') nextX++;

        // Boundary checks
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) return { ...agent, isDead: true };

        // Goal check
        if (nextX === goal.x && nextY === goal.y) return { ...agent, x: nextX, y: nextY, hasFinished: true };

        return { ...agent, x: nextX, y: nextY };
      });
      return updated;
    });

    setCurrentStep(prev => prev + 1);
  };

  const evolve = () => {
    setIsRunning(false);
    const scoredPop = population.map(a => ({ ...a, fitness: calculateFitness(a) }));
    const maxFit = Math.max(...scoredPop.map(a => a.fitness));
    setBestFitness(maxFit);

    // Selection
    const matingPool = scoredPop.filter(a => a.fitness > maxFit * 0.5);
    
    setGeneration(prev => prev + 1);
    setPopulation(initPopulation(matingPool));
    setCurrentStep(0);
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(nextStep, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, currentStep]);

  const reset = () => {
    setIsRunning(false);
    setGeneration(1);
    setCurrentStep(0);
    setPopulation(initPopulation());
    setBestFitness(0);
  };

  return (
    <div id="genetic-lab-root" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div id="genetic-grid-card" className="lg:col-span-3 glass-panel rounded-2xl p-6 relative flex items-center justify-center lab-grid-bg">
        <div id="evolution-grid" className="grid grid-cols-15 gap-1 w-full max-w-[500px] aspect-square">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isGoal = x === goal.x && y === goal.y;
            
            return (
              <div 
                key={i} 
                className={`relative rounded-sm border border-slate-800 transition-colors ${
                  isGoal ? 'bg-lab-accent/20 border-lab-accent shadow-[0_0_10px_rgba(244,114,182,0.3)]' : 'bg-slate-900/30'
                }`}
              >
                {isGoal && <Target className="w-full h-full p-1 text-lab-accent animate-pulse" />}
              </div>
            );
          })}
          
          {/* Agents */}
          {population.map((agent) => (
            <motion.div
              key={agent.id}
              id={`agent-${agent.id}`}
              className={`absolute w-4 h-4 rounded-full border border-lab-primary/50 shadow-sm flex items-center justify-center ${
                agent.isDead ? 'opacity-20 scale-75' : agent.hasFinished ? 'bg-lab-accent scale-125' : 'bg-lab-primary/40'
              }`}
              animate={{ 
                left: `${(agent.x / GRID_SIZE) * 100}%`,
                top: `${(agent.y / GRID_SIZE) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%` }}
            >
              <Users className="w-2 h-2 text-white" />
            </motion.div>
          ))}
        </div>

        <div id="genetic-objective-overlay" className="absolute top-4 left-6">
          <p className="mono-label">Objective: Reach the target through evolution</p>
        </div>
      </div>

      <div className="space-y-6">
        <div id="genetic-controls-card" className="glass-panel p-6 rounded-2xl space-y-6">
           <h3 className="font-semibold text-lg flex items-center gap-2">
             <Dna className="w-5 h-5 text-lab-primary" />
             Genetic Engine
           </h3>

           <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-lab-border pb-2">
                <p className="mono-label">Generation</p>
                <p id="gen-count" className="text-3xl font-bold font-mono">{generation}</p>
              </div>

              <div id="step-progress-container" className="space-y-1">
                <p className="mono-label">Step Index</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    id="step-progress-bar"
                    className="h-full bg-lab-primary"
                    animate={{ width: `${(currentStep / STEP_LIMIT) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="mono-label">Best Fitness</p>
                <p id="best-fitness-val" className="font-mono text-sm">{bestFitness.toFixed(4)}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  id="genetic-toggle-evolve"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isRunning ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-lab-primary text-lab-bg hover:bg-lab-secondary'
                  }`}
                >
                  {isRunning ? 'Pause' : <><Play className="w-4 h-4" /> Evolve</>}
                </button>
                <button
                  id="genetic-reset"
                  onClick={reset}
                  className="p-3 glass-panel rounded-xl hover:bg-lab-border transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
           </div>
        </div>

        <div id="genetic-insights" className="glass-panel p-6 rounded-2xl">
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Algorithm Insights</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "Natural Selection: The fittest individuals survive and pass their DNA to the next generation. 
            Random mutations prevent the population from getting stuck in local optima."
          </p>
        </div>
      </div>
    </div>
  );
}
