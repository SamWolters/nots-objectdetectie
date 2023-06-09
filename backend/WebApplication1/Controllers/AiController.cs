using Common;
using Microsoft.AspNetCore.Mvc;
using ObjectDetectionAPI.Services;
using System.Drawing;
using Yolov8Net;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IPredictor _predictor = YoloV8Predictor.Create(Path.Combine(Directory.GetCurrentDirectory(), "yolov8m.onnx"));
        private ClassifierService classifier = ClassifierService.Instance;

        [HttpPost(Name = "GetAiPredict")]
        public async Task<List<PredictionObject>> Post()
        {
            string requestBody;
            using(StreamReader reader = new StreamReader(Request.Body)) {
                requestBody = await reader.ReadToEndAsync();
            }
			
            byte[] bytes = Convert.FromBase64String(requestBody);

            using MemoryStream ms = new(bytes);
            Image image = Image.FromStream(ms);

            var prediction = _predictor.Predict(image);

            return prediction.Aggregate(new List<PredictionObject>(), (list, item) =>
            {
                KeyValuePair<string, float?> output = classifier.PredictImage(item, image);

                string warning = ((output.Value ?? item.Score) * 100) < 50 ? "prediction might be wrong" : "";

                float score = (output.Value ?? item.Score);

                list.Add(new PredictionObject() 
                { 
                    YoloLabel = item.Label.Name,
                    CustomLabel = output.Key, 
                    Confidence = score, 
                    X = item.Rectangle.X, 
                    Y = item.Rectangle.Y, 
                    Width = item.Rectangle.Width, 
                    Height = item.Rectangle.Height,
                    Warning = !string.IsNullOrEmpty(warning),
                    WarningMessage = warning
                });

                return list;
            });
        }
    }
}
