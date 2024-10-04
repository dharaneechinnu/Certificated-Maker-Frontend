import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RefreshCw, Download, Check } from 'lucide-react';
import './App.css';
import CertificateGuide from './components/CertificateGuide';

const App = () => {
  const [template, setTemplate] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [fontSize, setFontSize] = useState(70);
  const [fontFamily, setFontFamily] = useState('BaskervvilleSC-Regular');
  const [fontColor, setFontColor] = useState('#e2a244');
  const [yPosition, setYPosition] = useState(660);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [templateFileName, setTemplateFileName] = useState('');
  const [participantsFileName, setParticipantsFileName] = useState('');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showTrickMark, setShowTrickMark] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  const canvasRef = useRef(null);

  // Font options
  const fontOptions = [
    'BaskervvilleSC-Regular',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Helvetica',
    'Verdana'
  ];

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
  }, [previewImage, fontSize, fontFamily, fontColor, yPosition]);
  
  const handleTemplateChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      setTemplate(file);
      setTemplateFileName(file.name);
      setMessage('');
    } else {
      setMessage('Please upload a PNG file for the template');
    }
  };

  const handleParticipantsChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      setParticipants(file);
      setParticipantsFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const names = content.split('\n').filter(name => name.trim());
        setTotalFiles(names.length);
      };
      reader.readAsText(file);
      
      setMessage('');
    } else {
      setMessage('Please upload a TXT file for the participants list');
    }
  };

  const measureTextWidth = (ctx, text) => {
    const metrics = ctx.measureText(text);
    return {
      width: metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft,
      left: metrics.actualBoundingBoxLeft,
      right: metrics.actualBoundingBoxRight
    };
  };

  const calculateXPosition = (ctx, text, canvasWidth) => {
    const textMetrics = measureTextWidth(ctx, text);
    const textWidth = textMetrics.width;
    return Math.floor((canvasWidth - textWidth) / 2);
  };

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
      ctx.textBaseline = 'alphabetic';
      
      const sampleText = 'SAMPLE NAME';
      const xPosition = calculateXPosition(ctx, sampleText, canvas.width);
      
      ctx.fillText(sampleText, xPosition, yPosition);
    };
    img.src = previewImage;
  };

  const generateCertificate = (name, templateImg) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      
      ctx.drawImage(templateImg, 0, 0);
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textBaseline = 'alphabetic';
      
      const upperName = name.toUpperCase();
      const xPosition = calculateXPosition(ctx, upperName, canvas.width);
      
      ctx.fillText(upperName, xPosition, yPosition);
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!template || !participants) {
      setMessage('Please upload both the certificate template and the participants list');
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setGeneratedCount(0);
      setMessage('');
      setProcessingStep('Preparing template...');

      const templateImg = new Image();
      const templateUrl = URL.createObjectURL(template);
      
      templateImg.onload = async () => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target.result;
          const names = content.split('\n').filter(name => name.trim());
          
          setProcessingStep('Generating certificates...');
          
          const certificates = [];
          for (let i = 0; i < names.length; i++) {
            const name = names[i].trim();
            if (name) {
              const blob = await generateCertificate(name, templateImg);
              certificates.push({ name, blob });
              
              setGeneratedCount(i + 1);
              setProgress(Math.round(((i + 1) * 100) / names.length));
            }
          }

          setProcessingStep('Creating zip file...');
          
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          
          certificates.forEach(({ name, blob }) => {
            zip.file(`${name}.png`, blob);
          });
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          
          const url = URL.createObjectURL(zipBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'certificates.zip';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          
          setMessage('Certificates generated successfully!');
          setShowCompletionAnimation(true);
          setTimeout(() => {
            setShowCompletionAnimation(false);
            setShowTrickMark(true);
            setTimeout(() => setShowTrickMark(false), 2000);
          }, 1000);
        };
        reader.readAsText(participants);
      };
      templateImg.src = templateUrl;
      
    } catch (error) {
      console.error('Error generating certificates:', error);
      setMessage('An error occurred while generating certificates. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
      setProcessingStep('');
      setGeneratedCount(0);
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
                  <input 
                    type="file" 
                    className="file-input" 
                    onChange={handleTemplateChange} 
                    accept="image/png" 
                    required 
                  />
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
                  <input 
                    type="file" 
                    className="file-input" 
                    onChange={handleParticipantsChange} 
                    accept=".txt" 
                    required 
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Font Size (px)</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                min="10"
                max="200"
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">Y Position (px)</label>
              <input
                type="number"
                value={yPosition}
                onChange={(e) => setYPosition(parseInt(e.target.value))}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">Font Color</label>
              <div className="color-picker">
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: fontColor }}
                />
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="color-input"
                />
              </div>
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

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loader-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="loader-content"
            >
              <div className="loader-progress">
                <svg className="loader-circle" viewBox="0 0 100 100">
                  <circle 
                    className="loader-circle-bg" 
                    cx="50" 
                    cy="50" 
                    r="45"
                  />
                  <circle 
                    className="loader-circle-progress" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    style={{
                      strokeDasharray: `${progress * 2.83}, 283`
                    }}
                  />
                </svg>
                <div className="loader-percentage">{progress}%</div>
              </div>
              <div className="loader-text">
                <h3>{processingStep}</h3>
                <p>{generatedCount} of {totalFiles} certificates generated</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
};

export default App;