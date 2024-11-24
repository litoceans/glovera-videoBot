# Glovera Video Bot - AI-Powered Educational Counseling Platform

## Overview
Glovera Video Bot is an innovative AI-powered platform designed to provide international student counseling through an interactive video bot interface. The system combines advanced AI technologies with real-time video interaction to offer personalized guidance to students seeking educational opportunities abroad.

## Performance Highlights
- Ultra-fast inference time: 800-1200ms per conversation cycle
- Complete pipeline: VAD → Distil-Whisper (Groq) → LLM → TTS (Amazon Polly)
- Optimized for real-time interactions
- Production-ready after successful R&D phase

## Key Features
- Real-time video interaction with AI counselor
- Voice-based interaction using Amazon Polly TTS
- High-performance speech recognition with Distil-Whisper
- Ultra-fast response times (sub-second latency)
- Session management and history
- Secure authentication system
- Admin dashboard for monitoring
- Comprehensive student profile management

## Tech Stack
- **Frontend**: Next.js 13+
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI/ML**: 
  - LLaMA 3.1 for natural language processing
  - Amazon Polly for Text-to-Speech
  - Distil-Whisper on Groq for Speech-to-Text
  - Voice Activity Detection (VAD)
- **Authentication**: JWT-based auth system

## Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- Groq API access
- Required API keys for TTS/STT services

## Installation

### Frontend Setup
```bash
cd glovera-video-bot
npm install
npm run dev
```

### Backend Setup
```bash
cd glovera-backend
pip install -r requirements.txt
python main.py
```

## Environment Variables
Create `.env` files in both frontend and backend directories with the following variables:

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=your_backend_url
```

### Backend (.env)
```
MONGO_URL=your_mongodb_url
GROQ_API_KEY=your_groq_api_key
```

## Usage
1. Start the backend server
2. Launch the frontend application
3. Access the platform through `http://localhost:3000`

## Features in Detail
- **Video Bot Interface**: Interactive AI counselor with real-time video rendering
- **Voice Interaction**: Natural conversation through voice input/output
- **Session Management**: Track and manage student counseling sessions
- **Admin Dashboard**: Monitor and manage student interactions
- **Profile Management**: Comprehensive student profile handling

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Groq AI for LLM support
- Next.js team for the excellent framework
- FastAPI team for the robust backend framework
