import { useState, useRef, useEffect } from "react";
import "../styles.css";

export default function ImageUploader({ selectedGlasses }) {
  const [image, setImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const canvasRef = useRef(null);

  const FRAME_WIDTH = 1080;
  const FRAME_HEIGHT = 720;

  const [glassesPosition, setGlassesPosition] = useState({
    x: 400,
    y: 150,
    width: 280,
    height: 140, // 🚀 Este valor será atualizado automaticamente ao carregar os óculos
  });

  const [aspectRatio, setAspectRatio] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setBackgroundImage(img);
          setImage(reader.result);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 🚀 Redesenha a imagem de fundo corretamente mantendo a proporção
  useEffect(() => {
    if (!backgroundImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgWidth = backgroundImage.width;
    const imgHeight = backgroundImage.height;
    const scale = Math.min(FRAME_WIDTH / imgWidth, FRAME_HEIGHT / imgHeight);
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;

    const xOffset = (FRAME_WIDTH - newWidth) / 2;
    const yOffset = (FRAME_HEIGHT - newHeight) / 2;

    ctx.drawImage(backgroundImage, xOffset, yOffset, newWidth, newHeight);
  }, [backgroundImage]);

  // 🚀 Corrige a distorção inicial ao carregar os óculos
  useEffect(() => {
    if (!selectedGlasses) return;

    const glassesImg = new Image();
    glassesImg.src = selectedGlasses;

    glassesImg.onload = () => {
      const realAspectRatio = glassesImg.width / glassesImg.height;

      setAspectRatio(realAspectRatio);

      setGlassesPosition((prev) => ({
        ...prev,
        height: prev.width / realAspectRatio, // 🚀 Atualiza a altura corretamente na primeira seleção
      }));
    };
  }, [selectedGlasses]);

  // 🚀 Redesenha os óculos sem apagar a imagem de fundo
  useEffect(() => {
    if (!backgroundImage || !selectedGlasses) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgWidth = backgroundImage.width;
    const imgHeight = backgroundImage.height;
    const scale = Math.min(FRAME_WIDTH / imgWidth, FRAME_HEIGHT / imgHeight);
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;
    const xOffset = (FRAME_WIDTH - newWidth) / 2;
    const yOffset = (FRAME_HEIGHT - newHeight) / 2;

    ctx.drawImage(backgroundImage, xOffset, yOffset, newWidth, newHeight);

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
  }, [glassesPosition, selectedGlasses, backgroundImage]);

  // 👉 Movimento com Mouse
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

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

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setGlassesPosition((prev) => ({
      ...prev,
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 📌 Zoom com Scroll do Mouse (mantendo proporção real)
  const handleWheel = (e) => {
    e.preventDefault();
    setGlassesPosition((prev) => {
      const newWidth = Math.max(20, prev.width + e.deltaY * -0.1);
      return {
        ...prev,
        width: newWidth,
        height: aspectRatio ? newWidth / aspectRatio : prev.height,
      };
    });
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

      <div className="canvas-container" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
      </div>

      <div className="instructions-container">
        {selectedGlasses ? (
          <p className="drag-instruction">
            🖱️ Use o <strong>scroll do mouse</strong> ou{" "}
            <strong>pinça com os dedos</strong> para ajustar o tamanho dos
            óculos. 🖱️ <strong>Arraste os óculos</strong> para posicioná-los
            corretamente.
          </p>
        ) : (
          <p className="drag-instruction">
            📸 Primeiro, escolha uma imagem para começar.
          </p>
        )}
      </div>
    </div>
  );
}
