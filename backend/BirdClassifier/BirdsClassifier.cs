using Common;
using System.Drawing;
using System.Drawing.Imaging;

namespace Classifiers
{
    public class BirdsClassifier : IClassifier
    {
        public string ClassifiesObject { get; } = "bird";

        public KeyValuePair<string, float?> Predict(Image image)
        {
            using MemoryStream ms = new();
            image.Save(ms, ImageFormat.Jpeg);

            var input = new ModelInput()
            {
                ImageSource = ms.ToArray(),
            };

            return Birds.PredictAllLabels(input).First();
        }
    }
}
