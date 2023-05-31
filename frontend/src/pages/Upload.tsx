import { createRef, useState } from "react";

import { Navbar } from "../components/Navbar";
import { drawBoxesOnCanvas } from "../common/drawBoxesOnCanvas";

export const Upload = () => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const [showCanvas, setShowCanvas] = useState(false);

  const handlePredict = () => {
    const fileInput = document.getElementById("formFile") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString();
        const base64WithoutPrefix = base64?.substring(base64.indexOf(",") + 1);

        const img = new Image();
        img.src = base64!;
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          setShowCanvas(true);

          fetch("https://localhost:44333/Ai", {
            method: "POST",
            body: base64WithoutPrefix,
            headers: {
              "Content-Type": "text/plain", // Set the content type to plain text
            },
          })
            .then((response) => response.json())
            .then((data) => {
              if (ctx) {
                // Voor nu is dit altijd 1, maar stel dat je de canvas of video in verschillende resoluties wilt renderen is dit nodig.
                const aspectX = canvas.width / img.width;
                const aspectY = canvas.height / img.height;
                drawBoxesOnCanvas(ctx, data, aspectX, aspectY);
              }
              console.log(data);
              console.log("Image data sent successfully");
            })
            .catch((error) => {
              console.error(error);
            });
        };
      };
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <Navbar />
      <div className="h-100 container-fluid">
        <div className="d-flex flex-row gap-2 h-100 row justify-content-center align-items-center">
          <div className="d-flex flex-column col-3 gap-2 align-items-center">
            <label htmlFor="formFile" className="display-6 form-label" style={{ minWidth: "fit-content" }}>
              Upload Image
            </label>
            <input className="form-control" type="file" id="formFile" accept=".jpg,.jpeg" />
            <button className="btn btn-primary" type="button" onClick={handlePredict}>
              Predict
            </button>
          </div>
          <div className={`${showCanvas ? "d-block" : "d-none"} col-4`}>
            <canvas ref={canvasRef} className="rounded-2 w-100 shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
