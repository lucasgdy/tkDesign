import { useState, useEffect } from "react";
import "../styles.css";

export default function GlassesMenu({ onSelect }) {
  const [glassesOptions, setGlassesOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadGlasses = async () => {
      const glassesList = [];

      for (let i = 1; i <= 8; i++) {
        // Verifica até 20 imagens
        const imagePath = `/oculos/oculos${i}.png`;

        try {
          const response = await fetch(imagePath, { method: "HEAD" }); // Verifica se a imagem existe
          if (response.ok) {
            glassesList.push(imagePath); // Adiciona apenas se a resposta for válida
          }
        } catch (error) {
          console.error(`Erro ao verificar ${imagePath}:`, error);
        }
      }

      if (glassesList.length > 0) {
        setGlassesOptions(glassesList);
      } else {
        setGlassesOptions([]); // Evita mostrar imagens inválidas
      }
    };

    loadGlasses();
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
