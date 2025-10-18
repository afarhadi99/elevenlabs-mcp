import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const configSchema = z.object({
  apiKey: z.string().describe("ElevenLabs API key"),
});

export default function createServer({ config }) {
  const server = new McpServer({
    name: "ElevenLabs API",
    version: "1.0.0",
  });

  const apiKey = config.apiKey;
  const baseUrl = "https://api.elevenlabs.io/v1";

  // Helper function to make API requests
  async function makeRequest(endpoint, options = {}) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response;
  }

  // 1. Text to Speech
  server.registerTool("text-to-speech", {
    title: "Text to Speech",
    description: "Converts text into speech using a voice of your choice and returns audio",
    inputSchema: {
      voice_id: z.string().describe("ID of the voice to be used"),
      text: z.string().describe("The text that will get converted into speech"),
      model_id: z.string().optional().default("eleven_multilingual_v2").describe("Identifier of the model to use"),
      language_code: z.string().optional().describe("Language code (ISO 639-1) to enforce"),
      voice_settings: z.object({
        stability: z.number().min(0).max(1).optional(),
        similarity_boost: z.number().min(0).max(1).optional(),
        style: z.number().min(0).max(1).optional(),
        use_speaker_boost: z.boolean().optional(),
      }).optional().describe("Voice settings overriding stored settings"),
      output_format: z.string().optional().default("mp3_44100_128").describe("Output format of generated audio"),
      enable_logging: z.boolean().optional().default(true).describe("Enable request logging"),
      seed: z.number().int().min(0).max(4294967295).optional().describe("Seed for deterministic sampling"),
      previous_text: z.string().optional().describe("Text that came before the current request"),
      next_text: z.string().optional().describe("Text that comes after the current request"),
    },
  }, async ({ voice_id, text, model_id, language_code, voice_settings, output_format, enable_logging, seed, previous_text, next_text }) => {
    const body = {
      text,
      model_id,
      voice_settings,
    };
    
    if (language_code) body.language_code = language_code;
    if (seed !== undefined) body.seed = seed;
    if (previous_text) body.previous_text = previous_text;
    if (next_text) body.next_text = next_text;

    const queryParams = new URLSearchParams();
    if (output_format) queryParams.append("output_format", output_format);
    if (enable_logging !== undefined) queryParams.append("enable_logging", enable_logging.toString());

    const response = await makeRequest(
      `/text-to-speech/${voice_id}?${queryParams.toString()}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Generated audio file (${audioBuffer.byteLength} bytes, format: ${output_format})`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Audio}`,
        },
      ],
    };
  });

  // 2. Text to Speech Streaming
  server.registerTool("text-to-speech-streaming", {
    title: "Text to Speech Streaming",
    description: "Streams text-to-speech audio in real-time using chunked transfer encoding",
    inputSchema: {
      voice_id: z.string().describe("ID of the voice to be used"),
      text: z.string().describe("The text that will get converted into speech"),
      model_id: z.string().optional().default("eleven_multilingual_v2").describe("Identifier of the model to use"),
      output_format: z.string().optional().default("mp3_44100_128").describe("Output format of generated audio"),
    },
  }, async ({ voice_id, text, model_id, output_format }) => {
    const queryParams = new URLSearchParams();
    if (output_format) queryParams.append("output_format", output_format);

    const response = await makeRequest(
      `/text-to-speech/${voice_id}/stream?${queryParams.toString()}`,
      {
        method: "POST",
        body: JSON.stringify({ text, model_id }),
      }
    );

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Streamed audio file (${audioBuffer.byteLength} bytes)`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Audio}`,
        },
      ],
    };
  });

  // 3. Get Voices
  server.registerTool("get-voices", {
    title: "List Voices",
    description: "Gets a list of all available voices with search, filtering and pagination",
    inputSchema: {
      search: z.string().optional().describe("Search term to filter voices by"),
      page_size: z.number().int().min(1).max(100).optional().default(10).describe("How many voices to return"),
      sort: z.string().optional().describe("Field to sort by: 'created_at_unix' or 'name'"),
      sort_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
      voice_type: z.string().optional().describe("Type of voice: 'personal', 'community', 'default', 'workspace', 'non-default'"),
      category: z.string().optional().describe("Category: 'premade', 'cloned', 'generated', 'professional'"),
    },
  }, async ({ search, page_size, sort, sort_direction, voice_type, category }) => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (page_size) queryParams.append("page_size", page_size.toString());
    if (sort) queryParams.append("sort", sort);
    if (sort_direction) queryParams.append("sort_direction", sort_direction);
    if (voice_type) queryParams.append("voice_type", voice_type);
    if (category) queryParams.append("category", category);

    const response = await makeRequest(`/voices?${queryParams.toString()}`);
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 4. Get Voice by ID
  server.registerTool("get-voice", {
    title: "Get Voice Details",
    description: "Gets detailed information about a specific voice by ID",
    inputSchema: {
      voice_id: z.string().describe("ID of the voice to retrieve"),
    },
  }, async ({ voice_id }) => {
    const response = await makeRequest(`/voices/${voice_id}`);
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 5. Get Models
  server.registerTool("get-models", {
    title: "List Models",
    description: "Gets a list of all available AI models",
    inputSchema: {},
  }, async () => {
    const response = await makeRequest("/models");
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 6. Speech to Speech (Voice Changer)
  server.registerTool("speech-to-speech", {
    title: "Voice Changer",
    description: "Transform audio from one voice to another while maintaining emotion, timing and delivery",
    inputSchema: {
      voice_id: z.string().describe("ID of the voice to be used"),
      audio_base64: z.string().describe("Base64 encoded audio file"),
      model_id: z.string().optional().default("eleven_english_sts_v2").describe("Identifier of the model to use"),
      output_format: z.string().optional().default("mp3_44100_128").describe("Output format"),
      enable_logging: z.boolean().optional().default(true).describe("Enable request logging"),
      remove_background_noise: z.boolean().optional().default(false).describe("Remove background noise from audio"),
    },
  }, async ({ voice_id, audio_base64, model_id, output_format, enable_logging, remove_background_noise }) => {
    const queryParams = new URLSearchParams();
    if (output_format) queryParams.append("output_format", output_format);
    if (enable_logging !== undefined) queryParams.append("enable_logging", enable_logging.toString());

    const audioBuffer = Buffer.from(audio_base64, "base64");
    const formData = new FormData();
    formData.append("audio", new Blob([audioBuffer]), "audio.mp3");
    formData.append("model_id", model_id);
    if (remove_background_noise) formData.append("remove_background_noise", "true");

    const response = await fetch(`${baseUrl}/speech-to-speech/${voice_id}?${queryParams.toString()}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const resultBuffer = await response.arrayBuffer();
    const base64Result = Buffer.from(resultBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Generated audio file (${resultBuffer.byteLength} bytes)`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Result}`,
        },
      ],
    };
  });

  // 7. Sound Generation
  server.registerTool("sound-generation", {
    title: "Create Sound Effect",
    description: "Turn text into sound effects for videos, voice-overs or video games",
    inputSchema: {
      text: z.string().describe("The text that will get converted into a sound effect"),
      duration_seconds: z.number().min(0.5).max(30).optional().describe("Duration of the sound (0.5 to 30 seconds)"),
      prompt_influence: z.number().min(0).max(1).optional().default(0.3).describe("How closely generation follows the prompt"),
      loop: z.boolean().optional().default(false).describe("Whether to create a sound that loops smoothly"),
      model_id: z.string().optional().default("eleven_text_to_sound_v2").describe("Model ID for sound generation"),
      output_format: z.string().optional().default("mp3_44100_128").describe("Output format"),
    },
  }, async ({ text, duration_seconds, prompt_influence, loop, model_id, output_format }) => {
    const queryParams = new URLSearchParams();
    if (output_format) queryParams.append("output_format", output_format);

    const body = {
      text,
      model_id,
    };
    if (duration_seconds !== undefined) body.duration_seconds = duration_seconds;
    if (prompt_influence !== undefined) body.prompt_influence = prompt_influence;
    if (loop !== undefined) body.loop = loop;

    const response = await makeRequest(
      `/sound-generation?${queryParams.toString()}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Generated sound effect (${audioBuffer.byteLength} bytes)`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Audio}`,
        },
      ],
    };
  });

  // 8. Audio Isolation
  server.registerTool("audio-isolation", {
    title: "Audio Isolation",
    description: "Removes background noise from audio",
    inputSchema: {
      audio_base64: z.string().describe("Base64 encoded audio file"),
    },
  }, async ({ audio_base64 }) => {
    const audioBuffer = Buffer.from(audio_base64, "base64");
    const formData = new FormData();
    formData.append("audio", new Blob([audioBuffer]), "audio.mp3");

    const response = await fetch(`${baseUrl}/audio-isolation`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const resultBuffer = await response.arrayBuffer();
    const base64Result = Buffer.from(resultBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Isolated audio file (${resultBuffer.byteLength} bytes)`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Result}`,
        },
      ],
    };
  });

  // 9. Get History
  server.registerTool("get-history", {
    title: "Get History",
    description: "Gets history of all generated audio",
    inputSchema: {
      page_size: z.number().int().min(1).max(1000).optional().default(100).describe("Number of items to return"),
      start_after_history_item_id: z.string().optional().describe("Pagination cursor"),
    },
  }, async ({ page_size, start_after_history_item_id }) => {
    const queryParams = new URLSearchParams();
    if (page_size) queryParams.append("page_size", page_size.toString());
    if (start_after_history_item_id) queryParams.append("start_after_history_item_id", start_after_history_item_id);

    const response = await makeRequest(`/history?${queryParams.toString()}`);
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 10. Get History Item by ID
  server.registerTool("get-history-item", {
    title: "Get History Item",
    description: "Gets a specific history item by ID",
    inputSchema: {
      history_item_id: z.string().describe("ID of the history item to retrieve"),
    },
  }, async ({ history_item_id }) => {
    const response = await makeRequest(`/history/${history_item_id}`);
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 11. Get History Item Audio
  server.registerTool("get-history-item-audio", {
    title: "Get History Item Audio",
    description: "Downloads audio from a specific history item",
    inputSchema: {
      history_item_id: z.string().describe("ID of the history item"),
    },
  }, async ({ history_item_id }) => {
    const response = await makeRequest(`/history/${history_item_id}/audio`);
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Audio file (${audioBuffer.byteLength} bytes)`,
        },
        {
          type: "text",
          text: `Base64 encoded audio:\n${base64Audio}`,
        },
      ],
    };
  });

  // 12. Delete History Item
  server.registerTool("delete-history-item", {
    title: "Delete History Item",
    description: "Deletes a specific history item",
    inputSchema: {
      history_item_id: z.string().describe("ID of the history item to delete"),
    },
  }, async ({ history_item_id }) => {
    await makeRequest(`/history/${history_item_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted history item: ${history_item_id}`,
        },
      ],
    };
  });

  // 13. Get User Info
  server.registerTool("get-user", {
    title: "Get User Info",
    description: "Gets information about the current user and their subscription",
    inputSchema: {},
  }, async () => {
    const response = await makeRequest("/user");
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  // 14. Get User Subscription
  server.registerTool("get-subscription", {
    title: "Get Subscription",
    description: "Gets information about the user's subscription",
    inputSchema: {},
  }, async () => {
    const response = await makeRequest("/user/subscription");
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  return server.server;
}
