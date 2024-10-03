import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronDown, Upload, RefreshCw, Download } from 'lucide-react';



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

  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await axios.get('https://certificated-maker.onrender.com/fonts');
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
      ctx.textAlign = 'center';
      ctx.fillText('Sample Name', canvas.width / 2, yPosition);
    };
    img.src = previewImage;
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.files[0]);
  };

  const handleParticipantsChange = (e) => {
    setParticipants(e.target.files[0]);
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

      const response = await axios.post('https://certificated-maker.onrender.com/generate-certificates', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
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
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="title"
      >
        Advanced Certificate Generator
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
                    <p className="file-upload-text"><span className="bold">Click to upload</span> or drag and drop</p>
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
                    <p className="file-upload-text"><span className="bold">Click to upload</span> or drag and drop</p>
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

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="message"
        >
          {message}
        </motion.div>
      )}

      {loading && (
        <div className="loader-overlay">
          <div className="loader-content">
            <div className="loader-circle">
              <div className="loader-circle-inner" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="loader-text">{progress}% Complete</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
          background-color: #1a202c;
          color: #ffffff;
          padding: 2rem;
          font-family: Arial, sans-serif;
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

        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr;
          }
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
          background-color: #4299e1;
          transition: width 0.3s ease;
        }

        .loader-text {
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .loader-circle {
            width: 100px;
            height: 100px;
          }

          .loader-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;