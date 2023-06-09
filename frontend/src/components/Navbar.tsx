import { Link } from "react-router-dom";

import { LogoSVG } from "./LogoSVG";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <LogoSVG />
        <Link className="navbar-brand fs-4" to="/">
          Object Detective
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse fs-6" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/webcam">
                Webcam
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active btn btn-primary text-white fs-6" aria-current="page" to="/upload">
                Upload
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
