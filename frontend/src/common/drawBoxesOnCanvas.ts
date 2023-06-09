import { Prediction } from "../types/PredictionObject";
import { LabelColour } from "./labelColours";

export const drawBoxesOnCanvas = (
  ctx: CanvasRenderingContext2D,
  predictions: Prediction[],
  aspectX: number,
  aspectY: number
) => {
  for (const prediction of predictions) {
    const color = LabelColour[prediction.yoloLabel as keyof typeof LabelColour];

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.rect(prediction.x * aspectX, prediction.y * aspectY, prediction.width * aspectX, prediction.height * aspectY);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "14px Arial";
    ctx.fillText(
      `${prediction.customLabel ?? prediction.yoloLabel} (${Math.round(prediction.confidence * 100)}%)`,
      prediction.x * aspectX + 5,
      prediction.y * aspectY - 5
    );
  }
};
