using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common
{
    public class PredictionObject
    {
        public string YoloLabel { get; set; }
        public string CustomLabel { get; set; }
        public float Confidence { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public bool Warning { get; set; }
        public string WarningMessage { get; set; }
    }
}
