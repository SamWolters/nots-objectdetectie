using Common;
using System.Collections.Generic;
using System.Drawing;
using System.Reflection;
using Yolov8Net;
using static Tensorflow.TensorShapeProto.Types;

namespace ObjectDetectionAPI.Services
{ 
    public class ClassifierService {
        private static ClassifierService instance;
        private Dictionary<string, IClassifier> Classifiers = new Dictionary<string, IClassifier>();
        private const string DllFolder = "ClassifierDlls";
        private ClassifierService() {
            LookForExistingDlls();
        }

        // singleton
        public static ClassifierService Instance {
            get {
                if(instance == null) {
                    instance = new ClassifierService();
                }
                return instance;
            }
        }

        private void LookForExistingDlls() {
           
            string path = Path.Combine(Directory.GetCurrentDirectory(), DllFolder);
            string[] files = Directory.GetFiles(path, "*.dll");
            foreach(string file in files) {
                LoadAssembly(file);
            }
        }

        private void LoadAssembly(string file) {     
            Assembly assembly = Assembly.Load(File.ReadAllBytes(file));
            // We gaan op zoek naar een bruikbaar interface
            Type classifierType = typeof(IClassifier);
            var types = assembly.GetTypes();
            Type assignableType = types.FirstOrDefault(type => classifierType.IsAssignableFrom(type) && !type.IsInterface);

            // Is er een bruikbaar interface gevonden?
            if(assignableType != null) {
                var instance = Activator.CreateInstance(assignableType);
                IClassifier classifier = (IClassifier)instance;
                Classifiers.Add(classifier.ClassifiesObject, classifier);
            }
        }

        private Image CropImage(Image source, Rectangle section) {
            var bitmap = new Bitmap(section.Width, section.Height);
            using(var g = Graphics.FromImage(bitmap)) {
                g.DrawImage(source, 0, 0, section, GraphicsUnit.Pixel);
                return bitmap;
            }
        }

        public KeyValuePair<string, float?> PredictImage(Prediction prediction, Image image) {
            if(Classifiers.TryGetValue(prediction.Label.Name, out IClassifier classifier)) {
                Rectangle section = new(new Point((int)prediction.Rectangle.X, (int)prediction.Rectangle.Y), new Size((int)prediction.Rectangle.Width, (int)prediction.Rectangle.Height));
                Image CroppedImage = CropImage(image, section);
                return classifier.Predict(CroppedImage);
            }
            return new KeyValuePair<string, float?>(null, null);
        }
    }
}
