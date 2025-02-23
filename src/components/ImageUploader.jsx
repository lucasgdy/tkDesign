import { useState, useRef, useEffect } from "react";
import "../styles.css"; // Certifique-se de que este arquivo está importado corretamente

export default function ImageUploader({ selectedGlasses }) {
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);

  const FRAME_WIDTH = 1080;
  const FRAME_HEIGHT = 720;

  // Estado para posição e tamanho dos óculos
  const [glassesPosition, setGlassesPosition] = useState({
    x: 400,
    y: 250,
    width: 100,
    height: 50,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = FRAME_WIDTH;
      canvas.height = FRAME_HEIGHT;

      // Ajustar tamanho da imagem mantendo a proporção
      let scale = Math.min(FRAME_WIDTH / img.width, FRAME_HEIGHT / img.height);
      let newWidth = img.width * scale;
      let newHeight = img.height * scale;

      // Centralizar imagem no Canvas
      let xOffset = (FRAME_WIDTH - newWidth) / 2;
      let yOffset = (FRAME_HEIGHT - newHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);

      // Desenhar os óculos sem redimensionamento automático
      if (selectedGlasses) {
        const glassesImg = new Image();
        glassesImg.src = selectedGlasses;
        glassesImg.onload = () => {
          ctx.drawImage(
            glassesImg,
            glassesPosition.x,
            glassesPosition.y,
            glassesPosition.width,
            glassesPosition.height
          );
        };
      }
    };
  }, [image, selectedGlasses, glassesPosition]);

  // Iniciar movimento dos óculos
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Verifica se o clique está sobre os óculos para mover
    if (
      mouseX >= glassesPosition.x &&
      mouseX <= glassesPosition.x + glassesPosition.width &&
      mouseY >= glassesPosition.y &&
      mouseY <= glassesPosition.y + glassesPosition.height
    ) {
      setIsDragging(true);
      setOffset({
        x: mouseX - glassesPosition.x,
        y: mouseY - glassesPosition.y,
      });
    }
  };

  // Movimento do mouse (mover)
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setGlassesPosition({
      ...glassesPosition,
      x: mouseX - offset.x,
      y: mouseY - offset.y,
    });
  };

  // Parar movimento
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Ajustar tamanho dos óculos com o scroll do mouse
  const handleWheel = (e) => {
    e.preventDefault();
    setGlassesPosition((prev) => ({
      ...prev,
      width: Math.max(20, prev.width + e.deltaY * -0.1), // Ajusta o tamanho conforme o scroll
      height: Math.max(10, prev.height + e.deltaY * -0.1), // Mantém proporção
    }));
  };

  return (
    <div className="main-content">
      <button
        className="upload-btn"
        onClick={() => document.getElementById("fileInput").click()}
      >
        Escolher Imagem
      </button>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* 🔴 Aqui adicionamos o evento onWheel no Canvas */}
      <div className="canvas-container" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          className="border border-gray-300 my-4 rounded-lg shadow-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
      </div>

      {selectedGlasses && (
        <p className="drag-instruction">
          🖱️ Use o scroll para aumentar ou diminuir os óculos. 🖱️ Arraste os
          óculos para ajustar a posição.
        </p>
      )}
    </div>
  );
}
