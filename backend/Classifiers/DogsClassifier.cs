using Common;
using System.Drawing;
using System.Drawing.Imaging;

namespace Classifiers
{
    public class DogsClassifier : IClassifier
    {
        public static KeyValuePair<string, float?> Predict(Image image)
        {
            using MemoryStream ms = new();
            image.Save(ms, ImageFormat.Jpeg);

            var input = new ModelInput()
            {
                ImageSource = ms.ToArray(),
            };

            return Dogs.PredictAllLabels(input).First();
        }
    }
}
