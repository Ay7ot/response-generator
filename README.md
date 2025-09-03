# 📊 Research Response Generator

A sophisticated web application for generating synthetic survey responses for academic and market research. Create statistically representative datasets by defining questions with probability-based answer distributions.

![Research Response Generator](https://img.shields.io/badge/React-18.0+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.0+-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-cyan.svg)

## ✨ Features

### 🎯 Core Functionality
- **Question Builder**: Create single-choice and multiple-choice questions with customizable answer options
- **Probability Control**: Assign percentage-based probabilities to each answer option for realistic data distribution
- **Synthetic Data Generation**: Generate thousands of statistically representative responses
- **Excel Export**: Export data in multiple formats (Excel, CSV, SPSS-compatible)
- **Project Management**: Save and manage multiple research projects with drafts and completed states

### 🔐 Authentication & Data
- **Firebase Authentication**: Secure user authentication with email/password
- **Cloud Storage**: Save research projects to Firebase Firestore
- **Data Persistence**: Automatic saving with draft/complete status tracking
- **Cross-device Sync**: Access your projects from any device

### 🎨 User Experience
- **Apple-inspired UI**: Clean, modern interface following Apple's design system
- **Dark Mode**: Seamless light/dark mode toggle with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations, loading states, and feedback
- **Accessibility**: WCAG-compliant with proper ARIA labels and keyboard navigation

### 📊 Advanced Features
- **SPSS Export**: Generate data sheets compatible with statistical analysis software
- **Metadata Tracking**: Comprehensive project metadata including timestamps and response counts
- **Debug Tools**: Built-in Firebase testing and diagnostic tools
- **Real-time Validation**: Immediate feedback for question and response validation

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Apple Design System
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Data Export**: ExcelJS, XLSX, React Slick
- **Notifications**: React Toastify
- **Development**: ESLint, PostCSS, TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/research-response-generator.git
   cd research-response-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update Firestore rules (copy from debug tools in the app)

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Creating Your First Project

1. **Set Research Topic**: Enter a clear, descriptive topic for your survey
2. **Add Questions**: Click "Add Question" to create survey questions
3. **Configure Options**: For each question:
   - Choose question type (Single Choice or Multiple Choice)
   - Add answer options with descriptive text
   - Assign percentage probabilities (must total 100% for single choice)
4. **Generate Responses**: Specify the number of responses needed (up to 10,000)
5. **Export Data**: Download your synthetic dataset in Excel format

### Project Management

- **Save Drafts**: Work on projects and save them as drafts
- **Auto-save**: Enable cloud auto-save after generation
- **Load Projects**: Access your saved projects from any device
- **Version Control**: Track creation and update timestamps

## 📋 API Documentation

### Endpoints

#### `POST /api/generate-responses`
Generate synthetic responses for survey questions.

**Request Body:**
```json
{
  "topic": "Customer Satisfaction Survey",
  "questions": [
    {
      "text": "How satisfied are you?",
      "type": "single",
      "options": [
        { "text": "Very Satisfied", "percentage": 30 },
        { "text": "Satisfied", "percentage": 40 },
        { "text": "Neutral", "percentage": 20 },
        { "text": "Dissatisfied", "percentage": 10 }
      ]
    }
  ],
  "numResponses": 1000
}
```

**Response:** Excel file (.xlsx) containing:
- Metadata sheet with project information
- Questions sheet with question details
- Responses sheet with generated data
- SPSS sheet in statistical analysis format

#### `POST /api/save-research`
Save research project to Firebase.

#### `GET /api/load-projects`
Load user's saved research projects.

#### `POST /api/load-projects`
Load specific research project by ID.

#### `GET/POST /api/firebase-test`
Firebase diagnostic and testing tools.

## 🏗️ Project Structure

```
response-generator/
├── app/
│   ├── api/                    # API routes
│   │   ├── firebase-test/
│   │   ├── generate-responses/
│   │   ├── load-projects/
│   │   └── save-research/
│   ├── favicon.ico
│   ├── globals.css            # Apple design system styles
│   ├── layout.tsx             # Root layout with SEO
│   └── page.tsx               # Main application page
├── components/
│   ├── AuthModal.tsx          # Authentication modal
│   ├── DarkModeToggle.tsx     # Theme toggle component
│   ├── FirebaseDebug.tsx      # Development debug tools
│   ├── ProjectManager.tsx     # Project CRUD interface
│   ├── QuestionForm.tsx       # Question creation form
│   ├── QuestionList.tsx       # Question display carousel
│   └── ResponseGenerator.tsx  # Main application component
├── hooks/
│   └── useFirebase.ts         # Firebase authentication hook
├── lib/
│   └── firebase.ts            # Firebase configuration
└── fonts/                     # Custom fonts
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain Apple design system consistency
- Add proper error handling
- Include accessibility features
- Test on multiple devices/browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Apple Design System for UI inspiration
- Firebase for robust backend services
- Next.js team for the excellent framework
- Research community for the inspiration

## 📞 Support

If you find this project helpful for your research:

- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest features
- 📧 Reach out for collaboration

---

**Happy Researching! 🔬📊**
