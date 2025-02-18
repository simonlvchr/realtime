# Live Audio Transcription with Gladia API

This Node.js application captures audio from your microphone and provides real-time transcription using the Gladia API. It also includes sentiment analysis capabilities.

## Features

- 🎤 Real-time audio capture from microphone
- 🔄 Live transcription using WebSocket connection
- 😊 Sentiment analysis of spoken content
- ⚙️ Configurable audio parameters
- 🔐 Secure API key management

## Prerequisites

- Node.js (v14 or higher)
- npm
- A Gladia API key (get one at [https://app.gladia.io/](https://app.gladia.io/))
- A working microphone

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```
   GLADIA_KEY=your-api-key-here
   ```

## Configuration

Audio and processing settings can be configured in `index.js` by modifying the `AUDIO_CONFIG` object:

```javascript
const AUDIO_CONFIG = {
    bit_depth: 16,        // Options: 8, 16, 24, 32
    sample_rate: 16000,   // Options: 8000, 16000, 32000, 44100, 48000
    sentiment_analysis: true
};
```

## Usage

1. Start the application:
   ```bash
   node index.js
   ```

2. The application will:
   - Initialize your microphone
   - Establish a WebSocket connection with Gladia
   - Start capturing and transcribing audio
   - Display transcriptions and sentiment analysis in real-time

3. Console output includes:
   - 📝 Transcription results
   - 😊 Sentiment analysis (if enabled)
   - 🔄 Connection status
   - ❌ Error messages (if any)

## Dependencies

- `ws`: WebSocket client
- `node-fetch`: HTTP client
- `mic`: Microphone capture
- `dotenv`: Environment variable management

## Error Handling

The application includes error handling for:
- Missing API key
- API connection issues
- WebSocket errors
- Microphone access problems

## Notes

- Higher sample rates and bit depths may require more bandwidth
- Sentiment analysis is optional and can be disabled
- The application uses PCM WAV encoding for audio

## License

ISC

## Support

For API-related questions, visit [Gladia's documentation](https://docs.gladia.io/)
