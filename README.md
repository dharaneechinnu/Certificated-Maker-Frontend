# Advanced Certificate Generator

An elegant and powerful web application that allows you to generate customized certificates in bulk for events, courses, or any other purpose. Upload your certificate template and participant list, customize the text appearance, and generate professional-looking certificates with just a few clicks.

![Certificate Generator Preview](![image](https://github.com/user-attachments/assets/cad4b51a-b8fd-463a-825c-45bb81d97355)
)

## 🌟 Features

- **Bulk Certificate Generation**: Generate multiple certificates simultaneously from a single template
- **Customizable Text**: Control font family, size, color, and position
- **Real-time Preview**: See how your certificates will look before generating them
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Progress Tracking**: Visual feedback during the generation process
- **Drag & Drop**: Easy file upload interface
- **Download as ZIP**: Receive all certificates in a convenient ZIP file

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/certificate-generator.git
cd certificate-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Visit `http://localhost:3000` in your browser

### Production Deployment

The application is deployed at: https://certificate-generator.example.com

## 📝 Usage

1. **Prepare Your Files**:
   - Certificate template: PNG format with transparent area for names
   - Participant list: TXT file with one name per line

2. **Upload Files**:
   - Click the upload areas or drag and drop your files
   - Ensure your template is in PNG format
   - Verify your participant list is in TXT format

3. **Customize Text**:
   - Choose from available font families
   - Adjust font size (10-200px)
   - Select font color using the color picker
   - Set vertical position of text

4. **Preview**:
   - Check the real-time preview
   - Make adjustments as needed

5. **Generate**:
   - Click "Generate Certificates"
   - Wait for the process to complete
   - Download the ZIP file containing all certificates

## 🛠️ Technical Details

### Built With
- React.js
- Framer Motion for animations
- Axios for API requests
- Lucide React for icons
- Custom styling with CSS-in-JS

### API Endpoints

The application communicates with these endpoints:

- `GET /fonts`: Retrieves available font families
- `POST /generate-certificates`: Generates certificates and returns ZIP file

### File Requirements

- **Template**: PNG format, recommended size 1920x1080px
- **Participant List**: TXT file, UTF-8 encoded, one name per line

## Contributors
- Murugesh
- Dharaneedharan

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Font families provided by Google Fonts
- Icons by Lucide React
- Animation library by Framer Motion

## 📧 Contact

For support or queries, please email: support@certificategenerator.example.com

## 🐛 Known Issues

- Font preview may not be exact in certain browsers
- Maximum file size for template: 5MB
- Maximum participants in single generation: 1000

Please report any other issues in the GitHub repository's issue tracker.
