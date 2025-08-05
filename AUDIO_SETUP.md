# Audio Transcription Setup

To enable audio transcription with Whisper AI, you need to add your OpenAI API key.

## Steps:

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (it starts with `sk-`)

2. **Add the API Key to Your Environment**
   - Open the `.env` file in your project root
   - Add your key after `OPENAI_API_KEY=`
   - Example: `OPENAI_API_KEY=sk-your-actual-key-here`
   - Save the file

3. **Restart Your Development Server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

## Important Security Notes:
- **NEVER** commit your API key to git
- **NEVER** share your API key publicly
- The `.env` file is already in `.gitignore` for safety
- If you accidentally expose your key, revoke it immediately

## Testing:
1. Upload an audio file (MP3, WAV, etc.)
2. You should see the transcription appear below the file name
3. Send the message to see the full transcription in the chat

## Troubleshooting:
- Make sure your API key has access to the Whisper API
- Check the console for error messages
- Verify the API key is correctly added to `.env`
- Ensure you've restarted the dev server after adding the key
