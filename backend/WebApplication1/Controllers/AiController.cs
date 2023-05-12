using Classifiers;
using Common;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using Tensorflow;
using Yolov8Net;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IPredictor _predictor = YoloV8Predictor.Create("C:\\Users\\marij\\Downloads\\Yolov8.Net-main\\ConsoleApp1\\yolov8m.onnx");

        private Image CropImage(Image source, Rectangle section)
        {
            var bitmap = new Bitmap(section.Width, section.Height);
            using (var g = Graphics.FromImage(bitmap))
            {
                g.DrawImage(source, 0, 0, section, GraphicsUnit.Pixel);
                return bitmap;
            }
        }

        private KeyValuePair<string, float?> PredictImage(Prediction prediction, Image image)
        {
            Rectangle section = new(new Point((int)prediction.Rectangle.X, (int)prediction.Rectangle.Y), new Size((int)prediction.Rectangle.Width, (int)prediction.Rectangle.Height));
            Image CroppedImage = CropImage(image, section);

            switch (prediction.Label.Name)
            {
                case "dog":
                    return DogsClassifier.Predict(CroppedImage);
                case "car":
                    return CarBrandsClassifier.Predict(CroppedImage);
                default: return new KeyValuePair<string, float?> (null, null);
            }
        }

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
                KeyValuePair<string, float?> output = PredictImage(item, image);

                if (output.Value != null)
                {
                    string warning = (output.Value * 100) < 50 ? "prediction might be wrong" : "";

                    list.Add(new PredictionObject() 
                    { 
                        Label = output.Key, 
                        Confidence = (float)output.Value, 
                        X = item.Rectangle.X, 
                        Y = item.Rectangle.Y, 
                        Width = item.Rectangle.Width, 
                        Height = item.Rectangle.Height,
                        Warning = !string.IsNullOrEmpty(warning),
                        WarningMessage = warning
                    });
                }

                return list;
            });
        }
    }
}
