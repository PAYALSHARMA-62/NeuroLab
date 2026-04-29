import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Cpu, Network, Settings2 } from 'lucide-react';

interface Node {
  id: string;
  layer: number;
  activation: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

export default function NeuralCanvasLab() {
  const [layers, setLayers] = useState([3, 4, 2]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputs, setInputs] = useState([0.8, 0.2, 0.5]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    layers.forEach((nodeCount, layerIdx) => {
      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          id: `node-${layerIdx}-${i}`,
          layer: layerIdx,
          activation: layerIdx === 0 ? inputs[i] || 0 : 0
        });
        
        if (layerIdx > 0) {
          const prevLayerCount = layers[layerIdx - 1];
          for (let j = 0; j < prevLayerCount; j++) {
            newEdges.push({
              source: `node-${layerIdx-1}-${j}`,
              target: `node-${layerIdx}-${i}`,
              weight: Math.random() * 2 - 1
            });
          }
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [layers, inputs]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate changing inputs
      setInputs(prev => prev.map(v => Math.max(0, Math.min(1, v + (Math.random() * 0.2 - 0.1)))));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;
      const updatedNodes = [...prevNodes];
      
      // Simple forward pass simulation
      for (let l = 1; l < layers.length; l++) {
        for (let i = 0; i < layers[l]; i++) {
          const nodeId = `node-${l}-${i}`;
          const targetNodeIdx = updatedNodes.findIndex(n => n.id === nodeId);
          if (targetNodeIdx === -1) continue;

          let weightedSum = 0;
          const incomingEdges = edges.filter(e => e.target === nodeId);
          
          incomingEdges.forEach(edge => {
            const sourceNode = updatedNodes.find(n => n.id === edge.source);
            if (sourceNode) {
              weightedSum += sourceNode.activation * edge.weight;
            }
          });

          // Sigmoid activation
          updatedNodes[targetNodeIdx].activation = 1 / (1 + Math.exp(-weightedSum));
        }
      }
      
      // Update first layer with current inputs
      layers[0] && Array.from({length: layers[0]}).forEach((_, i) => {
        const nodeIdx = updatedNodes.findIndex(n => n.id === `node-0-${i}`);
        if (nodeIdx !== -1) updatedNodes[nodeIdx].activation = inputs[i] || 0;
      });

      return updatedNodes;
    });
  }, [inputs, layers, edges]);

  return (
    <div id="neural-lab-root" className="flex flex-col h-full gap-6">
      <div id="neural-lab-header" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lab-primary/20 rounded-lg">
            <Network className="w-6 h-6 text-lab-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Neural Architecture Visualizer</h2>
            <p className="mono-label">Real-time inference simulation</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            id="neural-toggle-live"
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isLive ? 'bg-lab-primary/20 text-lab-primary border border-lab-primary/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
            {isLive ? 'Live Stream' : 'Paused'}
          </button>
        </div>
      </div>

      <div id="neural-canvas-container" className="flex-1 glass-panel rounded-3xl p-8 relative overflow-hidden flex items-center justify-center lab-grid-bg">
        <svg id="neural-network-svg" className="w-full h-full min-h-[400px]">
          {/* Edges */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const xSpace = 100 / (layers.length + 1);
            const sourceX = (sourceNode.layer + 1) * xSpace;
            const targetX = (targetNode.layer + 1) * xSpace;

            const sourceYSpace = 100 / (layers[sourceNode.layer] + 1);
            const targetYSpace = 100 / (layers[targetNode.layer] + 1);
            
            // Extracting index from ID
            const sourceIdx = parseInt(edge.source.split('-')[2]);
            const targetIdx = parseInt(edge.target.split('-')[2]);

            const sy = (sourceIdx + 1) * sourceYSpace;
            const ty = (targetIdx + 1) * targetYSpace;

            return (
              <motion.line
                key={`edge-${idx}`}
                x1={`${sourceX}%`}
                y1={`${sy}%`}
                x2={`${targetX}%`}
                y2={`${ty}%`}
                stroke={edge.weight > 0 ? '#38bdf8' : '#f472b6'}
                strokeWidth={Math.abs(edge.weight) * 3}
                strokeOpacity={sourceNode.activation * 0.5 + 0.1}
                strokeDasharray={edge.weight < 0 ? "4" : "0"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, idx) => {
            const xSpace = 100 / (layers.length + 1);
            const x = (node.layer + 1) * xSpace;
            const ySpace = 100 / (layers[node.layer] + 1);
            const nodeInLayerIdx = parseInt(node.id.split('-')[2]);
            const y = (nodeInLayerIdx + 1) * ySpace;

            return (
              <g key={node.id}>
                <motion.circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={12 + node.activation * 14}
                  fill="#1e293b"
                  stroke={node.activation > 0.5 ? '#38bdf8' : '#64748b'}
                  strokeWidth={2}
                  className="cursor-pointer"
                />
                <motion.circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={8 + node.activation * 10}
                  fill="#38bdf8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: node.activation }}
                />
                <text
                  x={`${x}%`}
                  y={`${y + 35}%`}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {node.activation.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Labels Overlay */}
        <div className="absolute top-4 left-0 w-full flex justify-around px-8 pointer-events-none">
          <div className="text-center">
            <p className="mono-label text-lab-primary">Input Layer</p>
          </div>
          <div className="text-center">
            <p className="mono-label">Hidden Layer</p>
          </div>
          <div className="text-center">
            <p className="mono-label text-lab-accent">Output Layer</p>
          </div>
        </div>
      </div>

      <div id="neural-lab-settings" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div id="neural-params-card" className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-lab-primary" />
            <h3 className="text-sm font-semibold">Tuning Parameters</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="input-nodes-slider" className="mono-label flex justify-between">Inputs<span>{layers[0]} Nodes</span></label>
              <input 
                id="input-nodes-slider"
                type="range" min="1" max="5" value={layers[0]} 
                onChange={(e) => setLayers([parseInt(e.target.value), layers[1], layers[2]])}
                className="w-full accent-lab-primary" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hidden-nodes-slider" className="mono-label flex justify-between">Hidden<span>{layers[1]} Nodes</span></label>
              <input 
                id="hidden-nodes-slider"
                type="range" min="1" max="8" value={layers[1]} 
                onChange={(e) => setLayers([layers[0], parseInt(e.target.value), layers[2]])}
                className="w-full accent-lab-primary" 
              />
            </div>
          </div>
        </div>

        <div id="neural-activations-card" className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-lab-accent" />
            <h3 className="text-sm font-semibold">Live Activations</h3>
          </div>
          <div id="activations-grid" className="flex flex-wrap gap-4">
             {inputs.map((val, i) => (
               <div key={i} className="flex-1 min-w-[100px] space-y-1">
                 <div className="flex justify-between items-center text-[10px] font-mono">
                   <span>IN_{i}</span>
                   <span className="text-lab-primary">{val.toFixed(2)}</span>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    className="h-full bg-lab-primary"
                    animate={{ width: `${val * 100}%` }}
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
