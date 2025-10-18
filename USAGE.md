# ElevenLabs MCP Server - Usage Guide

## Quick Start

1. **Get your ElevenLabs API key** from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Development mode**:
   ```bash
   npm run dev
   ```
   This starts the server with Smithery CLI, which will give you a playground URL to test your server.

## Available Tools

### 1. Text to Speech

Convert text to speech with full control over voice settings.

**Tool**: `text-to-speech`

**Parameters**:
- `voice_id` (required): ID of the voice to use
- `text` (required): Text to convert to speech
- `model_id` (optional): AI model to use (default: "eleven_multilingual_v2")
- `language_code` (optional): Language code (ISO 639-1)
- `voice_settings` (optional): Object with stability, similarity_boost, style, use_speaker_boost
- `output_format` (optional): Audio format (default: "mp3_44100_128")
- `enable_logging` (optional): Enable/disable logging (default: true)
- `seed` (optional): Seed for deterministic generation
- `previous_text` (optional): Context from previous generation
- `next_text` (optional): Context for next generation

**Example**:
```
Generate speech for "Hello, world!" using voice ID "21m00Tcm4TlvDq8ikWAM"
```

### 2. Text to Speech Streaming

Stream audio in real-time for lower latency.

**Tool**: `text-to-speech-streaming`

**Parameters**:
- `voice_id` (required): Voice ID
- `text` (required): Text to convert
- `model_id` (optional): Model ID
- `output_format` (optional): Audio format

### 3. List Voices

Get all available voices with filtering options.

**Tool**: `get-voices`

**Parameters**:
- `search` (optional): Search term
- `page_size` (optional): Results per page (1-100, default: 10)
- `sort` (optional): Sort field ("created_at_unix" or "name")
- `sort_direction` (optional): "asc" or "desc"
- `voice_type` (optional): Filter by type
- `category` (optional): Filter by category

**Example**:
```
List all available professional voices
```

### 4. Get Voice Details

Get detailed information about a specific voice.

**Tool**: `get-voice`

**Parameters**:
- `voice_id` (required): Voice ID to retrieve

### 5. List Models

Get all available AI models and their capabilities.

**Tool**: `get-models`

**Parameters**: None

**Example**:
```
Show me all available ElevenLabs models
```

### 6. Voice Changer (Speech to Speech)

Transform audio from one voice to another while preserving timing and emotion.

**Tool**: `speech-to-speech`

**Parameters**:
- `voice_id` (required): Target voice ID
- `audio_base64` (required): Base64 encoded audio file
- `model_id` (optional): Model ID (default: "eleven_english_sts_v2")
- `output_format` (optional): Output format
- `enable_logging` (optional): Enable logging
- `remove_background_noise` (optional): Remove background noise (default: false)

**Example**:
```
Change the voice in this audio file to voice ID "xyz123" (provide base64 audio)
```

### 7. Sound Generation

Create sound effects from text descriptions.

**Tool**: `sound-generation`

**Parameters**:
- `text` (required): Description of the sound effect
- `duration_seconds` (optional): Duration (0.5-30 seconds)
- `prompt_influence` (optional): How closely to follow prompt (0-1, default: 0.3)
- `loop` (optional): Create seamlessly looping sound (default: false)
- `model_id` (optional): Model ID
- `output_format` (optional): Output format

**Example**:
```
Create a sound effect of "dog barking loudly" with 2 seconds duration
```

### 8. Audio Isolation

Remove background noise from audio.

**Tool**: `audio-isolation`

**Parameters**:
- `audio_base64` (required): Base64 encoded audio file

**Example**:
```
Remove background noise from this audio file (provide base64 audio)
```

### 9. Get History

Get history of all generated audio.

**Tool**: `get-history`

**Parameters**:
- `page_size` (optional): Number of items (1-1000, default: 100)
- `start_after_history_item_id` (optional): Pagination cursor

**Example**:
```
Show my last 50 generated audio files
```

### 10. Get History Item

Get details about a specific history item.

**Tool**: `get-history-item`

**Parameters**:
- `history_item_id` (required): History item ID

### 11. Get History Item Audio

Download audio from a history item.

**Tool**: `get-history-item-audio`

**Parameters**:
- `history_item_id` (required): History item ID

### 12. Delete History Item

Delete a history item.

**Tool**: `delete-history-item`

**Parameters**:
- `history_item_id` (required): History item ID to delete

### 13. Get User Info

Get information about the current user.

**Tool**: `get-user`

**Parameters**: None

**Example**:
```
Show my ElevenLabs account information
```

### 14. Get Subscription

Get subscription details.

**Tool**: `get-subscription`

**Parameters**: None

**Example**:
```
Show my subscription status and usage limits
```

## Audio Formats

Supported output formats:
- `mp3_22050_32` - MP3 at 22.05kHz, 32kbps
- `mp3_44100_32` - MP3 at 44.1kHz, 32kbps
- `mp3_44100_64` - MP3 at 44.1kHz, 64kbps
- `mp3_44100_96` - MP3 at 44.1kHz, 96kbps
- `mp3_44100_128` - MP3 at 44.1kHz, 128kbps (default)
- `mp3_44100_192` - MP3 at 44.1kHz, 192kbps (Creator tier+)
- `pcm_16000` - PCM at 16kHz
- `pcm_22050` - PCM at 22.05kHz
- `pcm_24000` - PCM at 24kHz
- `pcm_44100` - PCM at 44.1kHz (Pro tier+)
- `ulaw_8000` - μ-law at 8kHz (for Twilio)

## Working with Audio

All audio is returned as base64-encoded strings. To use the audio:

### In Node.js
```javascript
const audioBuffer = Buffer.from(base64Audio, 'base64');
fs.writeFileSync('output.mp3', audioBuffer);
```

### In Browser
```javascript
const audioBlob = new Blob(
  [Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))],
  { type: 'audio/mpeg' }
);
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

## Popular Voice IDs

Some popular pre-made voices:
- **Rachel**: `21m00Tcm4TlvDq8ikWAM` - Calm, young female
- **Drew**: `29vD33N1CtxCmqQRPOHJ` - Well-rounded male
- **Clyde**: `2EiwWnXFnvU5JabPnv8n` - War veteran male
- **Paul**: `5Q0t7uMcjvnagumLfvZi` - Ground reporter male
- **Domi**: `AZnzlk1XvdvUeBnXmlld` - Strong female
- **Dave**: `CYw3kZ02Hs0563khs1Fj` - Conversational male
- **Fin**: `D38z5RcWu1voky8WS1ja` - Sailor male
- **Sarah**: `EXAVITQu4vr4xnSDxMaL` - Soft female
- **Antoni**: `ErXwobaYiN019PkySvjV` - Well-rounded male
- **Thomas**: `GBv7mTt0atIp3Br8iCZE` - Calm male
- **Charlie**: `IKne3meq5aSn9XLyUdCD` - Casual male
- **Emily**: `LcfcDJNUP1GQjkzn1xUU` - Calm female
- **Elli**: `MF3mGyEYCl7XYWbV9V6O` - Emotional female
- **Callum**: `N2lVS1w4EtoT3dr4eOWO` - Intense male
- **Patrick**: `ODq5zmih8GrVes37Dizd` - Shouty male
- **Harry**: `SOYHLrjzK2X1ezoPC6cr` - Anxious male
- **Liam**: `TX3LPaxmHKxFdv7VOQHJ` - Articulate male
- **Dorothy**: `ThT5KcBeYPX3keUQqHPh` - Pleasant female
- **Josh**: `TxGEqnHWrfWFTfGW9XjX` - Deep male
- **Arnold**: `VR6AewLTigWG4xSOukaG` - Crisp male
- **Charlotte**: `XB0fDUnXU5powFXDhCwa` - Seductive female
- **Alice**: `Xb7hH8MSUJpSbSDYk0k2` - Confident female
- **Matilda**: `XrExE9yKIg1WjnnlVkGX` - Warm female
- **James**: `ZQe5CZNOzWyzPSCn5a3c` - Calm male
- **Joseph**: `Zlb1dXrM653N07WRdFW3` - Articulate male
- **Jeremy**: `bVMeCyTHy58xNoL34h3p` - Excited male
- **Michael**: `flq6f7yk4E4fJM5XTYuZ` - Expressive male
- **Ethan**: `g5CIjZEefAph4nQFvHAz` - Whisper male
- **Chris**: `iP95p4xoKVk53GoZ742B` - Casual male
- **Gigi**: `jBpfuIE2acCO8z3wKNLl` - Childish female
- **Freya**: `jsCqWAovK2LkecY7zXl4` - Expressive female
- **Brian**: `nPczCjzI2devNBz1zQrb` - Deep male
- **Grace**: `oWAxZDx7w5VEj9dCyTzz` - Southern female
- **Daniel**: `onwK4e9ZLuTAKqWW03F9` - Deep male
- **Lily**: `pFZP5JQG7iQjIQuC4Bku` - Warm female
- **Serena**: `pMsXgVXv3BLzUgSXRplE` - Pleasant female
- **Adam**: `pNInz6obpgDQGcFmaJgB` - Deep male
- **Nicole**: `piTKgcLEGmPE4e6mEKli` - Whisper female
- **Bill**: `pqHfZKP75CvOlQylNhV4` - Trustworthy male
- **Jessie**: `t0jbNlBVZ17f02VDIeMI` - Raspy male
- **Sam**: `yoZ06aMxZJJ28mfd3POQ` - Raspy male
- **Glinda**: `z9fAnlkpzviPz146aGWa` - Witch female
- **Giovanni**: `zcAOhNBS3c14rBihAFp1` - Foreigner male
- **Mimi**: `zrHiDhphv9ZnVXBqCLjz` - Childish female

Use the `get-voices` tool to get the complete list with all details.

## Best Practices

1. **Cache Voice IDs**: Store commonly used voice IDs rather than querying every time
2. **Use Streaming**: For real-time applications, use the streaming endpoint
3. **Set Seeds**: Use seeds for consistent results when testing
4. **Monitor Usage**: Check your subscription limits with `get-subscription`
5. **Clean History**: Regularly delete old history items to manage storage
6. **Context Text**: Use `previous_text` and `next_text` for better multi-part audio
7. **Optimize Format**: Choose appropriate audio format for your use case (lower bitrate for streaming)

## Troubleshooting

### "API Error: 401"
Your API key is invalid or missing. Check your configuration.

### "API Error: 429"
You've hit rate limits. Wait a moment and try again, or upgrade your plan.

### "API Error: 422"
Invalid parameters. Check the tool input schema and ensure all required fields are provided correctly.

### Audio playback issues
Ensure you're decoding the base64 audio correctly and using the right MIME type for the format.

## Support

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs Discord](https://discord.gg/elevenlabs)
- [MCP Documentation](https://modelcontextprotocol.org/)
- [Smithery Documentation](https://smithery.ai/docs)
