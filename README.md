<<<<<<< HEAD
# 🌿 Autonomous Smart Farming Agent

An AI-powered smart farming web application that helps farmers detect leaf diseases, check weather reports, analyze soil data, and get real-time farming recommendations.

## 🚀 Features

- **Leaf Disease Detection** – Upload a leaf image and get AI-powered disease diagnosis
- **Weather Reports** – Real-time weather data with farming advice
- **Soil Analysis** – Enter soil values and get health analysis + fertilizer recommendations
- **Irrigation Advice** – Smart irrigation recommendations based on soil + weather
- **Crop Recommendation** – Suggest suitable crops based on soil and climate
- **History** – Track all past predictions and recommendations
- **Dashboard** – Overview of all farm metrics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Weather | OpenWeatherMap API |
| AI/ML | Mock model (CNN-ready structure) |

## 📁 Project Structure

```
smart-farming/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, error handling
│   └── server.js
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── pages/    # All page components
│   │   ├── components/ # Reusable components
│   │   ├── context/  # React context (auth, etc.)
│   │   └── utils/    # Helper functions
│   └── index.html
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenWeatherMap API key (free at https://openweathermap.org/api)

### 1. Clone / Open the project

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 4. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-farming
JWT_SECRET=your_jwt_secret_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/predict-disease | Leaf disease prediction |
| GET | /api/weather | Get weather data |
| POST | /api/soil-recommendation | Soil analysis |
| POST | /api/irrigation-advice | Irrigation recommendation |
| POST | /api/crop-recommendation | Crop suggestion |
| GET | /api/history | Get user history |

## 🤖 Adding a Real ML Model

The disease prediction endpoint is structured to accept a CNN model. To integrate:
1. Train a CNN on PlantVillage dataset
2. Export as TensorFlow.js or ONNX
3. Replace mock logic in `backend/controllers/diseaseController.js`

## 📄 License
MIT
=======
# Smart-Farming-Agent_Full_Stack
Developed a full-stack smart farming application using AI to detect crop diseases and predict risks. Utilized CNN, time-series models, Node.js backend, MongoDB database, and an interactive frontend to deliver real-time agricultural recommendations.
>>>>>>> bdc6960c547d545ee471a0b61c833176b0b8ec96
