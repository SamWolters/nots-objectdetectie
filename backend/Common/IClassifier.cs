using System.Drawing;

namespace Common
{
    public interface IClassifier
    {
        public string ClassifiesObject { get; }
        public KeyValuePair<string, float?> Predict(Image image);
    }
}
