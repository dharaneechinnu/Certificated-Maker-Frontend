import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Image, FileText, Type, Palette, Download, X, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: AlertCircle,
    title: "Before You Begin",
    description: "Prepare your certificate template (PNG) and participant list (TXT) before starting the process.",
    type: "info"
  },
  {
    icon: Image,
    title: "Step 1: Prepare Your Template",
    description: (
      <ul className="step-list">
        <li>Create your certificate design in any image editing software</li>
        <li>Save as PNG format with transparent area for names</li>
        <li>Recommended size: 1920x1080 pixels</li>
        <li>Maximum file size: 5MB</li>
      </ul>
    )
  },
  {
    icon: FileText,
    title: "Step 2: Prepare Participant List",
    description: (
      <>
        <ul className="step-list">
          <li>Create a plain text file (.txt)</li>
          <li>Enter one name per line</li>
          <li>Ensure proper spelling and formatting</li>
          <li>Maximum 1000 names per generation</li>
        </ul>
        <div className="code-example">
          <code>
            John Doe<br/>
            Jane Smith<br/>
            Alex Johnson
          </code>
        </div>
      </>
    )
  },
  {
    icon: Type,
    title: "Step 3: Configure Text Settings",
    description: (
      <>
        <p>Customize how names appear on your certificates:</p>
        <ul className="step-list">
          <li>Select from available font families</li>
          <li>Adjust font size (10-200px)</li>
          <li>Choose text color</li>
          <li>Set vertical position</li>
        </ul>
      </>
    )
  },
  {
    icon: Palette,
    title: "Step 4: Preview and Adjust",
    description: (
      <>
        <p>Use the real-time preview to:</p>
        <ul className="step-list">
          <li>Verify text placement</li>
          <li>Check font appearance</li>
          <li>Ensure color contrast</li>
          <li>Make necessary adjustments</li>
        </ul>
      </>
    )
  },
  {
    icon: Download,
    title: "Step 5: Generate and Download",
    description: (
      <>
        <p>Final steps:</p>
        <ol className="step-list">
          <li>Click "Generate Certificates" button</li>
          <li>Wait for processing (progress bar will show status)</li>
          <li>Download ZIP file containing all certificates</li>
          <li>Extract and verify generated certificates</li>
        </ol>
      </>
    )
  },
  {
    icon: CheckCircle,
    title: "Pro Tips",
    description: (
      <div className="pro-tips">
        <p>• Test with a small list first to verify settings</p>
        <p>• Use high-resolution templates for best results</p>
        <p>• Keep participant names under 50 characters</p>
        <p>• Consider font readability when choosing colors</p>
      </div>
    ),
    type: "success"
  }
];

const CertificateGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  if (!isOpen) {
    return (
      <button className="start-guide-btn" onClick={() => setIsOpen(true)}>
        Start Guide
      </button>
    );
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="guide-overlay">
      <div className="guide-modal">
        <button className="close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        <div className={`step-content ${currentStepData.type || ''}`}>
          <Icon className="step-icon" />
          <h3 className="step-title">{currentStepData.title}</h3>
          <div className="step-description">
            {currentStepData.description}
          </div>
        </div>

        <div className="step-footer">
          <div className="step-counter">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button className="next-btn" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .guide-modal {
          background: #1f2937;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          width: 100%;
          position: relative;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          color: #fff;
          background: #374151;
        }

        .step-content {
          text-align: center;
          padding: 20px 0;
          color: #fff;
        }

        .step-content.info {
          color: #60a5fa;
        }

        .step-content.success {
          color: #34d399;
        }

        .step-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
        }

        .step-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #fff;
        }

        .step-description {
          color: #9ca3af;
          line-height: 1.6;
          text-align: left;
        }

        .step-list {
          list-style-type: disc;
          margin-left: 20px;
          margin-top: 12px;
        }

        .step-list li {
          margin-bottom: 8px;
        }

        .code-example {
          background: #111827;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
        }

        .code-example code {
          color: #34d399;
          font-family: monospace;
        }

        .pro-tips p {
          margin-bottom: 8px;
        }

        .step-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #374151;
        }

        .step-counter {
          color: #9ca3af;
          font-size: 14px;
        }

        .next-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .next-btn:hover {
          background: #2563eb;
        }

        .start-guide-btn {
          position:absolute;
          bottom: 24px;
          right: 24px;
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .start-guide-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .guide-modal {
            padding: 20px;
            margin: 12px;
          }

          .step-title {
            font-size: 20px;
          }

          .step-footer {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
            text-align: center;
          }

          .next-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateGuide;