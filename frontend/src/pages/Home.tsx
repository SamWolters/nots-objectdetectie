import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
export const Home = () => {
  return (
    <>
      <Navbar />

      <div className="h-100 container-fluid d-flex align-items-center justify-content-center text-center text-black">
        <div>
          <h1 className="fs-1 mb-5">The place for detecting objects</h1>
          <div className="mt-5">
            <p>Upload or use your webcam to detect the objects in images.</p>

            <Link to="/upload">
              <button className="btn btn-primary btn-lg rounded-3 mx-5">
                Upload
              </button>
            </Link>
            <Link to="/webcam">
              <button className="btn btn-primary btn-lg rounded-3 mx-5">
                Webcam
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
