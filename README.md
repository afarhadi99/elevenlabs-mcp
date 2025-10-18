# ElevenLabs MCP Server

A comprehensive Model Context Protocol (MCP) server for the ElevenLabs API, providing access to all major ElevenLabs features including text-to-speech, voice generation, audio isolation, and more.

## Features

This MCP server provides tools for:

### Text to Speech
- **text-to-speech**: Convert text to speech with customizable voice settings
- **text-to-speech-streaming**: Stream text-to-speech audio in real-time

### Voice Management
- **get-voices**: List all available voices with search and filtering
- **get-voice**: Get detailed information about a specific voice
- **get-models**: List all available AI models

### Audio Transformation
- **speech-to-speech**: Transform audio from one voice to another (voice changer)
- **sound-generation**: Create sound effects from text descriptions
- **audio-isolation**: Remove background noise from audio

### History & User Management
- **get-history**: Get history of all generated audio
- **get-history-item**: Get a specific history item by ID
- **get-history-item-audio**: Download audio from a history item
- **delete-history-item**: Delete a history item
- **get-user**: Get current user information
- **get-subscription**: Get user subscription details

## Installation

```bash
npm install
```

## Configuration

The server requires an ElevenLabs API key. You can configure this when connecting the server to your MCP client.

### Configuration Schema

```json
{
  "apiKey": "your-elevenlabs-api-key-here"
}
```

## Usage with Smithery

### Development

```bash
npm run dev
```

This will start the server in development mode with hot reloading.

### Build

```bash
npm run build
```

### Deploy to Smithery

1. Push your code to GitHub
2. Go to [Smithery](https://smithery.ai)
3. Click "Deploy" and connect your GitHub repository

## Usage with Claude Desktop or Cursor

Add this to your MCP settings:

```json
{
  "mcpServers": {
    "elevenlabs": {
      "url": "your-smithery-deployment-url",
      "config": {
        "apiKey": "your-elevenlabs-api-key"
      }
    }
  }
}
```

## API Key

Get your ElevenLabs API key from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys).

## Example Usage

### Generate Speech

```
Use the text-to-speech tool to convert "Hello, world!" to speech using voice ID "21m00Tcm4TlvDq8ikWAM"
```

### List Available Voices

```
Use the get-voices tool to see all available voices
```

### Create Sound Effect

```
Use the sound-generation tool to create a "dog barking" sound effect
```

### Remove Background Noise

```
Use the audio-isolation tool to remove background noise from an audio file (provide base64 encoded audio)
```

## API Reference

All tools follow the [ElevenLabs API documentation](https://elevenlabs.io/docs/api-reference/introduction).

### Audio Format

Audio files are returned as base64-encoded strings. Supported formats include:
- MP3 (various bitrates)
- PCM (various sample rates)
- μ-law format (for Twilio)

## Development

The server is built using:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP SDK
- [@smithery/sdk](https://github.com/smithery-ai/sdk) - Smithery SDK  
- [zod](https://github.com/colinhacks/zod) - Schema validation

## License

MIT

## Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs/api-reference/introduction)
- [MCP Documentation](https://modelcontextprotocol.org/)
- [Smithery Documentation](https://smithery.ai/docs)
