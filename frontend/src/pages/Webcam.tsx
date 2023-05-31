import React, { Component } from "react";

import { Navbar } from "../components/Navbar";
import { WebcamCaptureProps } from "../types/WebcamCaptureProps";
import { WebcamCaptureState } from "../types/WebcamCaptureState";

import "bootstrap/dist/css/bootstrap.min.css";
import { drawBoxesOnCanvas } from "../common/drawBoxesOnCanvas";

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

      this.setState({ showCamera: false });

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
            drawBoxesOnCanvas(context, data, aspectX, aspectY);
          }
          console.log(data);
          console.log("Image data sent successfully");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  handleResetButtonClick = () => {
    this.setState({ showCamera: true });

    const canvas = this.canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  render() {
    return (
      <div className="d-flex flex-column h-100">
        <Navbar />
        <div className="h-100 container-fluid">
          <div className="d-flex flex-column gap-2 h-100 row justify-content-center align-items-center">
            <div className="col-6 col-sm-6">
              <video
                ref={this.videoRef}
                className={`${this.state.showCamera ? "d-block" : "d-none"} rounded-2 w-100 shadow-lg`}
                autoPlay
              />
              <canvas
                ref={this.canvasRef}
                className={`${this.state.showCamera ? "d-none" : "d-block"} rounded-2 w-100 shadow-lg`}
              />
            </div>
            <div className="col-6 col-sm-6 d-flex flex-column align-items-center">
              {this.state.showCamera && (
                <button className="btn btn-primary" onClick={this.handleCaptureButtonClick}>
                  Capture
                </button>
              )}
              {!this.state.showCamera && (
                <button className="btn btn-danger" onClick={this.handleResetButtonClick}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
