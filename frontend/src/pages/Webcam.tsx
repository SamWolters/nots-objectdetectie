import React, { Component } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

interface WebcamCaptureProps {}
interface WebcamCaptureState {
  imageData: string | null;
  showCamera: boolean;
}

interface Prediction {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  warning: boolean;
  warningMessage: string;
}

export class Webcam extends Component<WebcamCaptureProps, WebcamCaptureState> {
  private videoRef: React.RefObject<HTMLVideoElement>;
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private mediaStream: MediaStream | null;

  constructor(props: WebcamCaptureProps) {
    super(props);

    this.videoRef = React.createRef<HTMLVideoElement>();
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    this.mediaStream = null;

    this.state = {
      imageData: null,
      showCamera: true,
    };
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (this.videoRef.current) {
          this.videoRef.current.srcObject = stream;
          this.mediaStream = stream;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentWillUnmount() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  handleCaptureButtonClick = () => {
    if (this.videoRef.current && this.canvasRef.current) {
      const video = this.videoRef.current;
      const canvas = this.canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const imageData = canvas.toDataURL("image/png");
      const base64Value = imageData.split(",")[1];

      fetch("https://localhost:44333/Ai", {
        method: "POST",
        body: base64Value,
        headers: {
          "Content-Type": "text/plain", // Set the content type to plain text
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (context) {
            // Voor nu is dit altijd 1, maar stel dat je de canvas of video in verschillende resoluties wilt renderen is dit nodig.
            const aspectX = canvas.width / video.videoWidth;
            const aspectY = canvas.height / video.videoHeight;
            this.drawBoxesOnCanvas(context, data, aspectX, aspectY);
          }
          console.log(data);
          console.log("Image data sent successfully");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  drawBoxesOnCanvas = (ctx: CanvasRenderingContext2D, predictions: Prediction[], aspectX: number, aspectY: number) => {
    for (const prediction of predictions) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00ff00";
      ctx.rect(prediction.x * aspectX, prediction.y * aspectY, prediction.width * aspectX, prediction.height * aspectY);
      ctx.stroke();
      ctx.fillStyle = "#00ff00";
      ctx.font = "14px Arial";
      ctx.fillText(
        `${prediction.label} (${Math.round(prediction.confidence * 100)}%)`,
        prediction.x * aspectX + 5,
        prediction.y * aspectY - 5
      );
    }
  };

  handleResetButtonClick = () => {
    this.setState({ imageData: null, showCamera: true });
  };

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center mb-3">
          {/* this.state.showCamera && */}
          <div className="col-6 col-sm-6">
            <video ref={this.videoRef} autoPlay />
          </div>
          {/* !this.state.showCamera && this.state.imageData && */}

          <div className="col-6 col-sm-6">
            <canvas ref={this.canvasRef} />
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-sm-6">
            {this.state.showCamera && <button onClick={this.handleCaptureButtonClick}>Capture</button>}

            {!this.state.showCamera && <button onClick={this.handleResetButtonClick}>Reset</button>}
          </div>
        </div>

        {/* {this.state.imageData && (
          <div className="row justify-content-center">
            <div className="col-12 col-sm-6">
              <img src={this.state.imageData} alt="Captured Frame" className="img-fluid" />
            </div>
          </div>
        )} */}
      </div>
    );
  }
}
