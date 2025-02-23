import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import GlassesMenu from "./components/GlassesMenu";
import "./styles.css";

export default function App() {
  const [selectedGlasses, setSelectedGlasses] = useState(null);

  return (
    <div className="container">
      <GlassesMenu onSelect={setSelectedGlasses} />
      <ImageUploader selectedGlasses={selectedGlasses} />
    </div>
  );
}
