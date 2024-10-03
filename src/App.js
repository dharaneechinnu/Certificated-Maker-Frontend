import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

function App() {
  const [template, setTemplate] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [fontFamily, setFontFamily] = useState('Lato'); // Default font
  const [fontSize, setFontSize] = useState(80);
  const [fontColor, setFontColor] = useState('#ffd700'); // Gold color in hex
  const [xPosition, setXPosition] = useState(720); // Default value set to 720
  const [yPosition, setYPosition] = useState(720); // Default value set to 720
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fonts, setFonts] = useState([]); // State to store fonts

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await axios.get('https://certificated-maker.onrender.com/fonts'); // Fetch fonts from backend
        setFonts(response.data); // Store fonts in state
      } catch (error) {
        console.error('Error fetching fonts:', error);
      }
    };

    fetchFonts(); // Call the function to fetch fonts
  }, []);

  const handleTemplateChange = (e) => {
    setTemplate(e.target.files[0]);
  };

  const handleParticipantsChange = (e) => {
    setParticipants(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!template || !participants) {
      alert("Please upload both the certificate template and the participants list.");
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
      setMessage('');

      const response = await axios.post('https://certificated-maker.onrender.com/generate-certificates', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
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
    }
  };

  return (
    <AppContainer>
      <Title>Certificate Generator</Title>
      <FormContainer onSubmit={handleSubmit}>
        <InputGrid>
          <div>
            <Label>Upload Certificate Template (PNG):</Label>
            <CustomFileInput className={template ? 'uploaded' : ''}>
              Choose File
              <FileInput type="file" accept="image/png" onChange={handleTemplateChange} required />
            </CustomFileInput>
          </div>
          <div>
            <Label>Upload Participants List (TXT):</Label>
            <CustomFileInput className={participants ? 'uploaded' : ''}>
              Choose File
              <FileInput type="file" accept=".txt" onChange={handleParticipantsChange} required />
            </CustomFileInput>
          </div>
          <div>
            <Label>Font Family:</Label>
            <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {fonts.map((font) => (
                <option key={font.family} value={font.family}>
                  {font.family}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Font Size (in px):</Label>
            <Input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              min="10"
              max="200"
              required
            />
          </div>
          <div>
            <Label>Font Color:</Label>
            <ColorPickerContainer>
              <ColorPreview style={{ backgroundColor: fontColor }} />
              <ColorInput
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
              />
            </ColorPickerContainer>
          </div>
          <div>
            <Label>X Position (in px):</Label>
            <Input
              type="number"
              value={xPosition}
              onChange={(e) => setXPosition(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Y Position (in px):</Label>
            <Input
              type="number"
              value={yPosition}
              onChange={(e) => setYPosition(e.target.value)}
              required
            />
          </div>
        </InputGrid>
        <Button type="submit" disabled={loading}>
          {loading ? 'Generating Certificates...' : 'Generate Certificates'}
        </Button>
      </FormContainer>

      {message && <Message>{message}</Message>}
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff;
  text-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
`;

const FormContainer = styled.form`
 
  border-radius: 15px;
  padding: 20px;
 
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr; // Stack inputs on smaller screens
  }
`;

const Label = styled.label`
padding: 10px;
  font-weight: bold;
  color: #fff;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 2px solid transparent;
  outline: none;
  font-size: 1em;
  margin-bottom: 10px;
  transition: border 0.3s;

  &:focus {
    border: 2px solid #ffd700; // Highlight on focus
  }
`;

const FileInput = styled(Input)`
  cursor: pointer;
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 2px solid transparent;
  outline: none;
  font-size: 1em;

  &:focus {
    border: 2px solid #ffd700; // Highlight on focus
  }
`;

const Button = styled.button`
  padding: 15px 20px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;

  &:hover {
    background: #ff4757;
    box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.25);
    transform: translateY(-3px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px #ffd700; // Highlight on focus
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  font-size: 1.2em;
  text-align: center;
  margin-top: 20px;
`;

const CustomFileInput = styled.label`
  display: block;
  padding: 12px;
  border-radius: 8px;
  border: 2px dashed #fff;
  text-align: center;
  cursor: pointer;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.uploaded {
    border-color: #ffd700; // Change border color when file is uploaded
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Space between color preview and input
`;

const ColorPreview = styled.div`
  width: 30px; // Width of the color preview
  height: 30px; // Height of the color preview
  border: 2px solid #fff; // White border
  border-radius: 5px; // Rounded corners
`;

const ColorInput = styled.input`
  width: 100%; // Make the color input fill available space
  cursor: pointer; // Pointer cursor for better UX
  border: none; // Remove default border
  outline: none; // Remove outline
`;

export default App;
