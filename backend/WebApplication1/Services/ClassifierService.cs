using Common;
using System.Drawing;
using System.Reflection;
using Yolov8Net;

namespace ObjectDetectionAPI.Services
{ 
    public class ClassifierService {
        private static ClassifierService instance;
        private Dictionary<string, IClassifier> Classifiers = new Dictionary<string, IClassifier>();
        private Dictionary<string, Assembly> LoadedAssemblies = new Dictionary<string, Assembly>();
        private FileSystemWatcher Watcher;
        private const string DllFolder = "ClassifierDlls";

        private ClassifierService() {
            LookForExistingDlls();
            SetupListenForDlls();
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

        private void SetupListenForDlls() {
            Watcher = new FileSystemWatcher();
            string path = Path.Combine(Directory.GetCurrentDirectory(), DllFolder);

            Watcher.Path = path;
            Watcher.Filter = "*.dll";
            Watcher.Created += OnDllFileCreated;
            Watcher.Deleted += OnDllFileDeleted;
            Watcher.EnableRaisingEvents = true;
        }
        private void OnDllFileCreated(object source, FileSystemEventArgs e) {
            var path = e.FullPath;

            Task.Run(async () =>
            {
                await WaitForFile(path);
                LoadAssembly(path);
            });
        }

        private void OnDllFileDeleted(object source, FileSystemEventArgs e) {
            var path = e.FullPath;
            RemoveAssembly(path);
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
                LoadedAssemblies.Add(file, assembly);
            }
        }

        private void RemoveAssembly(string file) {
            if(LoadedAssemblies.ContainsKey(file)) {
                Assembly assembly = LoadedAssemblies[file];
                Type classifierType = typeof(IClassifier);
                var types = assembly.GetTypes();
                Type assignableType = types.FirstOrDefault(type => classifierType.IsAssignableFrom(type) && !type.IsInterface);

                // Is er een geïmplementeerde classifier gevonden?
                if(assignableType != null) {
                    IClassifier classifierToRemove = Classifiers.Values.FirstOrDefault(c => c.GetType() == assignableType);
                    if(classifierToRemove != null) {
                        Classifiers.Remove(classifierToRemove.ClassifiesObject);
                    }
                }

                LoadedAssemblies.Remove(file);
            }
        }

        private async Task WaitForFile(string path) {
            const int maxRetries = 10;
            const int delayMilliseconds = 300;

            for(int retry = 0; retry < maxRetries; retry++) {
                try {
                    using(FileStream fs = File.Open(path, FileMode.Open, FileAccess.Read, FileShare.None)) {
                        // File is not locked, it can be loaded
                        fs.Close();
                        return;
                    }
                } catch(IOException) {
                    // File is locked, wait and retry
                    await Task.Delay(delayMilliseconds);
                }
            }

            Console.WriteLine($"Unable to load file: {path}");
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
