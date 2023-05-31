export interface Prediction {
  yoloLabel: string;
  customLabel: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  warning: boolean;
  warningMessage: string;
}
