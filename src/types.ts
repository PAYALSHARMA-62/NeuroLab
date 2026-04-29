export type LabType = 'perceptron' | 'neural' | 'genetic' | 'dashboard';

export interface LabInfo {
  id: LabType;
  title: string;
  description: string;
  icon: string;
}

export interface TrainingData {
  x: number;
  y: number;
  label: 1 | -1;
}

export interface PerceptronWeights {
  w1: number;
  w2: number;
  bias: number;
}
