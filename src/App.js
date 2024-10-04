import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Upload, RefreshCw, Download, Check } from 'lucide-react';
import CertificateGuide from './components/CertificateGuide';
import Api from './Api/Api';

const App = () => {
  const [template, setTemplate] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [fontFamily, setFontFamily] = useState('Lato');
  const [fontSize, setFontSize] = useState(80);
  const [fontColor, setFontColor] = useState('#ffd700');
  const [xPosition, setXPosition] = useState(720);
  const [yPosition, setYPosition] = useState(720);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [fonts, setFonts] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [templateFileName, setTemplateFileName] = useState('');
  const [participantsFileName, setParticipantsFileName] = useState('');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showTrickMark, setShowTrickMark] = useState(false); // New state for trick mark

  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await Api.get('/fonts');
        setFonts(response.data);
      } catch (error) {
        console.error('Error fetching fonts:', error);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    if (template) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(template);
    }
  }, [template]);

  useEffect(() => {
    if (previewImage) {
      updatePreview();
    }
  }, [previewImage, fontFamily, fontSize, fontColor, xPosition, yPosition]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.fillText('SAMPLE NAME', xPosition, yPosition);
    };
    img.src = previewImage;
  };

  const handleTemplateChange = (e) => {
    const file = e.target.files[0];
    setTemplate(file);
    setTemplateFileName(file.name);
  };

  const handleParticipantsChange = (e) => {
    const file = e.target.files[0];
    setParticipants(file);
    setParticipantsFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!template || !participants) {
      setMessage("Please upload both the certificate template and the participants list.");
      return;
    }

    const formData = new FormData();
    formData.append('template', template);
    formData.append('participants', participants);
    formData.append('fontFamily', fontFamily);
    formData.append('fontSize', fontSize);
    formData.append('fontColor', fontColor);
    formData.append('xPosition', xPosition);
    formData.append('yPosition', yPosition);

    try {
      setLoading(true);
      setProgress(0);
      setMessage('');

      const response = await Api.post('/generate-certificates', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);

          if (percentCompleted === 100) {
            // Show trick mark animation
            setShowTrickMark(true);
            setTimeout(() => setShowTrickMark(false), 3000); // Hide after 3 seconds
          }
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificates.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage('Certificates generated successfully!');
      setShowCompletionAnimation(true);
      setTimeout(() => setShowCompletionAnimation(false), 3000);
    } catch (error) {
      console.error('Error generating certificates:', error);
      setMessage('An error occurred while generating certificates. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="app">
       <CertificateGuide/>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="title"
      >
        Certificate Generator
      </motion.h1>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="form-container"
        >
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label className="label">Upload Certificate Template (PNG)</label>
              <div className="file-upload">
                <label className="file-upload-label">
                  <div className="file-upload-content">
                    <Upload className="icon" />
                    <p className="file-upload-text">
                      <span className="bold">Click to upload</span> or drag and drop
                    </p>
                    {templateFileName && <p className="file-name">{templateFileName}</p>}
                  </div>
                  <input type="file" className="file-input" onChange={handleTemplateChange} accept="image/png" required />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Upload Participants List (TXT)</label>
              <div className="file-upload">
                <label className="file-upload-label">
                  <div className="file-upload-content">
                    <Upload className="icon" />
                    <p className="file-upload-text">
                      <span className="bold">Click to upload</span> or drag and drop
                    </p>
                    {participantsFileName && <p className="file-name">{participantsFileName}</p>}
                  </div>
                  <input type="file" className="file-input" onChange={handleParticipantsChange} accept=".txt" required />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="select"
              >
                {fonts.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Font Size (px)</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                min="10"
                max="200"
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">Font Color</label>
              <div className="color-picker">
                <div className="color-preview" style={{ backgroundColor: fontColor }}></div>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="color-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">X Position (px)</label>
              <input
                type="number"
                value={xPosition}
                onChange={(e) => setXPosition(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">Y Position (px)</label>
              <input
                type="number"
                value={yPosition}
                onChange={(e) => setYPosition(e.target.value)}
                required
                className="input"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? <RefreshCw className="icon spinning" /> : <Download className="icon" />}
              {loading ? 'Generating...' : 'Generate Certificates'}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="preview-container"
        >
          <h2 className="preview-title">Certificate Preview</h2>
          <div className="preview-canvas-container">
            {previewImage ? (
              <canvas ref={canvasRef} className="preview-canvas" />
            ) : (
              <div className="preview-placeholder">
                Upload a template to see preview
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="message"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
  <div className="loader-overlay">
    <div className="loader-content">
      <div className="loader-circle">
        <motion.div
          className="loader-circle-inner"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
      <div className="loader-text">{progress}% Complete</div>
    </div>
  </div>
)}

<AnimatePresence>
  {showCompletionAnimation && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="completion-animation"
    >
      <Check className="check-icon" />
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {showTrickMark && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="trick-mark"
    >
      <Check className="trick-mark-icon" />
    </motion.div>
  )}
</AnimatePresence>

      <style jsx>{`
        /* Styles go here, including any new styles for the completion GIF */
        .app {
          min-height: 100vh;
          background-color: #1a202c;
          color: #ffffff;
          padding: 2rem;
          font-family: Arial, sans-serif;
        }

        .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .loader-content {
    background-color: #2d3748;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
  }

  .loader-circle {
    width: 150px;
    height: 150px;
    background-color: #4a5568; /* Keep the circle color dark */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;
  }

  .loader-circle-inner {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background-color: #48bb78; /* Change this color to the desired one */
    transition: width 0.3s ease;
  }

  .loader-text {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .completion-animation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #48bb78;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }

  .check-icon {
    color: #ffffff;
    width: 60px;
    height: 60px;
  }

  .trick-mark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    background-color: transparent;
  }

  .trick-mark-icon {
    color: #48bb78; // The color for the trick mark
    width: 50px;
    height: 50px;
  }

        .title {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 2rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .form-container, .preview-container {
          background-color: #2d3748;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .file-upload {
          width: 100%;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 8rem;
          border: 2px dashed #4a5568;
          border-radius: 0.5rem;
          cursor: pointer;
          background-color: #2d3748;
          transition: background-color 0.3s;
        }

        .file-upload-label:hover {
          background-color: #4a5568;
        }

        .file-upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .file-upload-text {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #a0aec0;
        }

        .bold {
          font-weight: bold;
        }

        .file-input {
          display: none;
        }

        .file-name {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .select, .input {
          width: 100%;
          padding: 0.5rem;
          background-color: #4a5568;
          border: 1px solid #4a5568;
          border-radius: 0.25rem;
          color: #ffffff;
          font-size: 1rem;
        }

        .select:focus, .input:focus {
          outline: none;
          border-color: #63b3ed;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .color-preview {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .color-input {
          flex-grow: 1;
          height: 2.5rem;
          padding: 0;
          background-color: #4a5568;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.75rem;
          background-color: #4299e1;
          color: #ffffff;
          font-size: 1rem;
          font-weight: bold;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .submit-button:hover {
          background-color: #3182ce;
        }

        .submit-button:disabled {
          background-color: #718096;
          cursor: not-allowed;
        }

        .icon {
          margin-right: 0.5rem;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .preview-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .preview-canvas-container {
          width: 100%;
          height: 16rem;
          background-color: #4a5568;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .preview-canvas {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #a0aec0;
        }

        .message {
          margin-top: 2rem;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .loader-content {
          background-color: #2d3748;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
        }

        .loader-circle {
          width: 150px;
          height: 150px;
          background-color: #4a5568;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          position: relative;
          overflow: hidden;
        }

        .loader-circle-inner {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 100%;
          background-color: #42a5e1;
          transition: width 0.3s ease;
        }

        .loader-text {
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .completion-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #48bb78;
          border-radius: 50%;
          width: 100px;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1001;
        }

        .check-icon {
          color: #ffffff;
          width: 60px;
          height: 60px;
        }

        .trick-mark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1001;
          background-color: transparent;
        }

        .trick-mark-icon {
          color: #48bb78; // The color for the trick mark
          width: 50px;
          height: 50px;
        }

        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr;
          }

          .loader-circle {
            width: 100px;
            height: 100px;
          }

          .loader-text {
            font-size: 1rem;
          }

          .completion-animation {
            width: 80px;
            height: 80px;
          }

          .check-icon {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
