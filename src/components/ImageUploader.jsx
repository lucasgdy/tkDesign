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
    height: 140, // Esse valor será atualizado automaticamente ao carregar os óculos
  });

  const [aspectRatio, setAspectRatio] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(null);

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

  // Função para salvar o canvas como imagem PNG
  const handleSave = () => {
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "imagem_com_oculos.png";
    link.href = imageURL;
    link.target = "_blank";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Desenha a imagem de fundo mantendo a proporção original
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

  // Calcula a proporção real dos óculos na primeira seleção e atualiza a altura
  useEffect(() => {
    if (!selectedGlasses) return;
    const glassesImg = new Image();
    glassesImg.src = selectedGlasses;
    glassesImg.onload = () => {
      const realAspectRatio = glassesImg.width / glassesImg.height;
      setAspectRatio(realAspectRatio);
      setGlassesPosition((prev) => ({
        ...prev,
        height: prev.width / realAspectRatio,
      }));
    };
  }, [selectedGlasses]);

  // Redesenha os óculos sem apagar o fundo
  useEffect(() => {
    if (!backgroundImage || !selectedGlasses || !aspectRatio) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redesenha o fundo proporcionalmente
    const imgWidth = backgroundImage.width;
    const imgHeight = backgroundImage.height;
    const scale = Math.min(FRAME_WIDTH / imgWidth, FRAME_HEIGHT / imgHeight);
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;
    const xOffset = (FRAME_WIDTH - newWidth) / 2;
    const yOffset = (FRAME_HEIGHT - newHeight) / 2;
    ctx.drawImage(backgroundImage, xOffset, yOffset, newWidth, newHeight);
    // Desenha os óculos
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
  }, [glassesPosition, selectedGlasses, backgroundImage, aspectRatio]);

  // Eventos de mouse
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

  // Zoom com scroll do mouse (mantendo a proporção real)
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

  // Eventos de toque para dispositivos móveis
  const handleTouchStart = (e) => {
    e.preventDefault(); // Bloqueia zoom/scroll padrão
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      if (
        touchX >= glassesPosition.x &&
        touchX <= glassesPosition.x + glassesPosition.width &&
        touchY >= glassesPosition.y &&
        touchY <= glassesPosition.y + glassesPosition.height
      ) {
        setIsDragging(true);
        setOffset({
          x: touchX - glassesPosition.x,
          y: touchY - glassesPosition.y,
        });
      }
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Bloqueia comportamento padrão
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setGlassesPosition((prev) => ({
        ...prev,
        x: touch.clientX - rect.left - offset.x,
        y: touch.clientY - rect.top - offset.y,
      }));
    } else if (e.touches.length === 2 && lastDistance) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleChange = newDistance / lastDistance;
      setGlassesPosition((prev) => {
        const newWidth = Math.max(20, prev.width * scaleChange);
        return {
          ...prev,
          width: newWidth,
          height: aspectRatio ? newWidth / aspectRatio : prev.height,
        };
      });
      setLastDistance(newDistance);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      setIsDragging(false);
      setLastDistance(null);
    }
  };

  return (
    <div className="main-content">
      <div
        className="action-buttons"
        style={{
          justifyContent: image && selectedGlasses ? "space-between" : "center",
        }}
      >
        <button
          className="upload-btn"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Escolher Imagem
        </button>
        {image && selectedGlasses && (
          <button className="save-btn" onClick={handleSave}>
            Salvar
          </button>
        )}
      </div>
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
