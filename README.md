# DocuMind AI 🤖📄

> Smart document management with AI-powered analysis, search, and organization

## ✨ Features

- 🔐 **Real Google OAuth** - Secure authentication with your Google account
- 🤖 **3 AI Providers** - Choose between Gemini, OpenAI GPT-4, or Hugging Face Llama
- 📸 **Smart Upload** - AI analyzes and categorizes documents automatically
- 🔍 **AI Search** - Natural language search through your documents
- 📁 **Smart Folders** - Organize documents with AI-suggested categories
- 📅 **Date Extraction** - Automatically detects expiry dates, due dates, etc.
- 🔤 **OCR** - Extract text from images and PDFs
- 🎨 **Beautiful UI** - Modern, mobile-first design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (for backend)
- Google OAuth Client ID
- At least one AI API key (Gemini, OpenAI, or Hugging Face)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd docufinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create `.env` file:
   ```env
GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_HUGGINGFACE_API_KEY=
VITE_GROQ_API_KEY=
VITE_PERPLEXITY_API_KEY=
   ```

4. **Start the backend**
   ```bash
   cd server
   npm start
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```

6. **Open the app**
   ```
   http://localhost:3000
   ```

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in 3 steps
- **[Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)** - Step-by-step OAuth configuration
- **[Hugging Face Setup](HUGGINGFACE_SETUP.md)** - How to use Hugging Face API
- **[Setup Guide](SETUP_GUIDE.md)** - Complete setup instructions
- **[AI Providers Comparison](AI_PROVIDERS_COMPARISON.md)** - Compare Gemini, OpenAI, and Hugging Face
- **[Architecture](ARCHITECTURE.md)** - System architecture and design
- **[What's New](WHATS_NEW.md)** - Latest features and updates

## 🤖 AI Providers

### Google Gemini (Default)
- ⚡ Fast (2-3s per document)
- 💰 Free tier available
- ⭐ Excellent accuracy

### OpenAI GPT-4
- 🎯 Highest accuracy
- 💡 Advanced reasoning
- 💰 Pay per use

### Hugging Face Llama
- 🔓 Open source
- 🔒 Privacy-focused
- 💰 Free tier (1,000/day)

**Switch anytime in Settings!**

## 🎯 Use Cases

- 📋 **Personal Documents** - IDs, bills, receipts
- 💼 **Business Documents** - Contracts, invoices
- 🏥 **Medical Records** - Prescriptions, reports
- 🎓 **Education** - Certificates, transcripts
- ✈️ **Travel** - Tickets, bookings, visas

## 🛠️ Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router

**Backend:**
- Node.js
- Express
- MongoDB
- JWT Authentication

**AI Services:**
- Google Gemini API
- OpenAI API
- Hugging Face Inference API

## 📱 Screenshots

*Coming soon*

## 🔐 Security

- OAuth 2.0 authentication
- JWT tokens
- API keys in environment variables
- No credentials in code
- Optional self-hosting (Hugging Face)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- OpenAI for GPT-4 Vision
- Hugging Face for open source models
- Meta for Llama models

## 📞 Support

- 📖 Check the [documentation](QUICKSTART.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Join our community discussions

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative folders
- [ ] Document versioning
- [ ] More AI providers
- [ ] Custom model fine-tuning
- [ ] Offline mode

---

Made with ❤️ by the DocuMind team
