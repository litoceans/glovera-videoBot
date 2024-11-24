import { NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';


export async function POST(req) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // Parse the multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const language = formData.get('lang');


    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert the file to a Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare form data for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', buffer, {
      filename: 'recording.mp3', //Save as MP3
      contentType: audioFile.type,
    });
    let model ='distil-whisper-large-v3-en';
    groqFormData.append('model', model);
    groqFormData.append('temperature', '0');
    groqFormData.append('response_format', 'json');
    // 

    // Send the audio to Groq API
    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', groqFormData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...groqFormData.getHeaders(),
      },
    });
    if (!response.data.text) {
      return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
    }

    return NextResponse.json({"text":response.data.text});
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json({ error: 'Failed to process audio', details: error.message }, { status: 500 });
  }
}
