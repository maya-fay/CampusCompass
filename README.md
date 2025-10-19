# CampusCompass
AI Hackathon Project

Campus Compass is an AI-powered campus navigation assistant designed to help students and visitors find their way with ease around the UWI Mona Campus. The chatbot provides real-time directions to campus locations, along with contextual details like opening hours, available facilities, and optional image previews. Integrated with the Google Maps API, the app also features an interactive map interface that displays estimated travel times and route information, making campus exploration intuitive and efficient.
## Groq (LLM) Setup

This project can use Groq as the LLM provider. The project includes a Groq-backed navigator adapter in `campus_navigator_groq.py`.

1. Install the Groq Python SDK (tested with v0.32.0):

```powershell
pip install groq==0.32.0
```

2. Set your Groq API key and (optionally) model in PowerShell for the current session:

```powershell
$env:GROQ_API_KEY = 'sk-...'
$env:GROQ_MODEL = 'openai/gpt-oss-20b'  # optional; default used if omitted
```

3. Start the Flask server from the project root so the process inherits the env vars:

```powershell
python flask_api.py
```

4. Test the navigator from the command line:

```powershell
# Quick single-query test
python campus_navigator_groq.py "Where is the library?"

# Or test the API endpoint
Invoke-RestMethod -Uri 'http://localhost:5000/api' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ query = "Where is the library?" })

````
