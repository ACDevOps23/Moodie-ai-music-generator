# Moodie – AI Spotify Playlist Generator

Moodie is a full-stack web application that generates Spotify playlists based on a user's mood and conversational input.
It combines an AI-powered chat interface with the Spotify Web API to automatically create curated playlists tailored to a user's emotional state.

The project demonstrates secure backend architecture, OAuth authentication, AI intent parsing, and third-party API integrations within a modern full-stack JavaScript environment.

# Features
- AI-driven chat interface that interprets user mood
- Automatic Spotify playlist generation
- Natural language → structured JSON intent parsing
- Spotify track search using song + artist matching
- Secure Spotify OAuth (Authorization Code with PKCE)
- JWT authentication with refresh tokens

- Playlist creation and track management
- Secure backend API with multiple vulnerability protections
- Modern React & TailWindCSS frontend

<img width="336" height="256" alt="Screenshot 2026-03-06 at 2 28 47 pm" src="https://github.com/user-attachments/assets/13108396-1573-4a77-b296-f2be1e344a11" />

The application separates responsibilities across three main layers:

# Frontend
- User interface
- Chat interaction
- Playlist display
- Authentication state

# Backend
- Authentication
- AI intent validation
- Spotify API orchestration
- Security enforcement
- External Services
- Spotify Web API
- Google Gemini API

# Technology Stack
- Frontend
- React
- Vite
- Zustand (state management)
- Axios
- React Router
- Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Axios
- Express Validator
- External APIs
- Spotify Web API
- Google Gemini API

# AI Intent Processing
Moodie uses Google Gemini as a structured intent parser rather than a traditional chatbot.
The model converts natural language into deterministic JSON that the backend can safely process.
This allows the application to combine natural language understanding with predictable backend logic.
e.g.,
      
    User message
        - I feel relaxed today, give me some chill R&B

            {
    "intent": "create_playlist",
    "mood": "relaxed",
    "genres": ["r&b"],
    "playlist_name": "Chill R&B Vibes",
    "tracks": [
        {
        "song": "Take My Breath",
        "artist": "The Weeknd"
        },
        {
        "song": "Gods Plan",
        "artist": "Drake"
        }
    ]
    }

The backend then performs the following steps:
- Validates the JSON structure
- Extracts track information
- Searches Spotify using song + artist matching
- Creates a playlist using the Spotify Web API
- Adds the validated tracks to the playlist
- This architecture ensures that AI output is validated and controlled before interacting with external APIs.

# Security Design
Security considerations were incorporated at multiple layers of the application.
- Authentication Security
- JWT access tokens with short expiration
- Refresh token rotation
- Tokens stored in HttpOnly cookies
- Server-side session validation
- Input Validation
- All user input is validated before processing

Mechanisms include:
- express-validator request validation
- Strict JSON schema validation for AI responses
- Sanitization of user-provided text
- AI Output Validation
- Because AI output cannot be trusted directly, responses from Gemini are validated before being used.
- Validation steps:
- Check JSON format
- Validate expected fields
- Enforce allowed values
- Reject malformed responses
- This prevents AI responses from directly triggering backend actions without verification.

Backend Protections
- The API includes safeguards against common web vulnerabilities:
- NoSQL injection protection
- Cross-site scripting mitigation
- CSRF protections
- Secure cookie configuration
- Rate limiting
- Environment-based configuration

# Legal: Development Only personal project

- This project is for educational/portfolio purposes only. It adheres to the Spotify Developer Policy by:
- Not using Spotify data to train or fine-tune AI models.
- Operating as a text-based intent parser (not a standalone voice assistant).
- Using OAuth 2.0 for secure, user-authorized access.

- The project is intended for non-commercial use
- No revenue, monetization, or commercial services are associated with the application
- The implementation is used solely for learning, experimentation, and technical demonstration
- The repository is maintained as a private portfolio project and is shared only with potential employers or      technical reviewers.

The project currently operates in Spotify development mode.
Reasons:
- Spotify requires approval before public production deployment.
- The application uses developer credentials intended for evaluation and demonstration.
- This repository therefore focuses on architecture and implementation quality not production hosting.

Project Purpose and API Usage
- This project was developed as a personal portfolio and educational project to demonstrate full-stack engineering concepts, including secure backend design, third-party API integration, and AI-assisted workflows.
- The application integrates with the Spotify Web API for playlist creation, modification, upload, retrieve and track search functionality.
- The application integrates with Google Gemini API as a JSON intent parser only to execute spotify schema function requested by the user. 
- No Spotify data or information is trained or fed to Google's Gemini API (AI).

# Author
Andrea Cimmino - Junior Full-Stack Developer

# License
Copyright (c) @2026 Andrea Cimmino. All Rights Reserved. 
- This software is NOT licensed for distribution, modification, or commercial usage.
- This project is intended for personal educational and portfolio purposes NOT for commercial or profitable usage. 


# User Sign in page
<img width="723" height="520" alt="Screenshot 2026-03-05 at 10 18 47 pm" src="https://github.com/user-attachments/assets/6e4b548c-553e-45e0-907b-1799bea87d40" />

# Spotify Login
<img width="882" height="554" alt="Screenshot 2026-03-05 at 10 59 29 pm" src="https://github.com/user-attachments/assets/416189b1-589b-45f3-8ac0-fe2ffe690ef8" />

# User Dashbaord - not logged into Spotify
<img width="1405" height="865" alt="Screenshot 2026-03-05 at 10 46 21 pm" src="https://github.com/user-attachments/assets/91fadabf-9edc-4bb6-b828-72ec384c8143" />

# User Dashbaord - logged into Spotify
<img width="1411" height="767" alt="Screenshot 2026-03-05 at 10 51 07 pm" src="https://github.com/user-attachments/assets/848616ae-30ae-4c04-975a-58df98e82711" />

# User Playlists from Spotify account
<img width="1662" height="977" alt="Screenshot 2026-03-05 at 10 52 44 pm" src="https://github.com/user-attachments/assets/f421a7bf-79fe-4559-91bf-81f567a62582" />

# AI Music Chat 
<img width="1394" height="902" alt="Screenshot 2026-03-05 at 10 58 42 pm" src="https://github.com/user-attachments/assets/3928ae5d-05be-4ebd-b8fb-af4c2bf2764a" />

# Account Settings
<img width="882" height="626" alt="Screenshot 2026-03-05 at 11 00 26 pm" src="https://github.com/user-attachments/assets/350c8d3d-85ce-4c07-85fc-e8aec0b53688" />


