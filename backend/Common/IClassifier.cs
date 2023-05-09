using System.Drawing;

namespace Common
{
    public interface IClassifier
    {
        public static abstract KeyValuePair<string, float?> Predict(Image image);
    }
}
