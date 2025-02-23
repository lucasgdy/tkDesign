import { useState, useEffect } from "react";
import "../styles.css";

export default function GlassesMenu({ onSelect }) {
  const [glassesOptions, setGlassesOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const repoName = "tkDesign"; // Substitua pelo nome do seu repositório no GitHub
    const basePath = `https://lucasgdy.github.io/${repoName}/oculos`;

    const glassesList = [];
    for (let i = 1; i <= 206; i++) {
      glassesList.push(`${basePath}/${i}.png`);
    }

    setGlassesOptions(glassesList);
  }, []);

  const handleSelect = (glasses) => {
    setSelected(glasses);
    onSelect(glasses);
  };

  return (
    <div className="menu">
      <h2>Escolha um Óculos</h2>
      <div className="glasses-options">
        {glassesOptions.length > 0 ? (
          glassesOptions.map((glasses, index) => (
            <div
              key={index}
              className={`glasses-item ${
                selected === glasses ? "selected" : ""
              }`}
              onClick={() => handleSelect(glasses)}
            >
              <img src={glasses} alt={`Óculos ${index + 1}`} />
            </div>
          ))
        ) : (
          <p>Nenhum óculos encontrado.</p>
        )}
      </div>
    </div>
  );
}
