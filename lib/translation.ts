// import axios from 'axios';

// const VOICE_RSS_KEY = 'c1a97dd1ded744e48d86ebb1e8ed368d';

// export const supportedLanguages = [
//   { code: 'en-US', name: 'English', voice: 'en-us' },
//   { code: 'es-ES', name: 'Spanish', voice: 'es-es' },
//   { code: 'de-DE', name: 'German', voice: 'de-de' },
//   { code: 'fr-FR', name: 'French', voice: 'fr-fr' },
//   { code: 'hi-IN', name: 'Hindi', voice: 'hi-in' },
// ];

// export async function translateText(text: string, fromLang: string, toLang: string) {
//   try {
//     // Convert language codes to simple format (e.g., 'en-US' to 'en')
//     const from = fromLang.split('-')[0];
//     const to = toLang.split('-')[0];

//     // Using Google Translate API
//     const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

//     const response = await axios.get(url);
    
//     // Extract translated text from response
//     const translatedText = response.data[0]
//       .map((item: any[]) => item[0])
//       .join('');

//     return translatedText;
//   } catch (error) {
//     console.error('Translation error:', error);
//     throw error;
//   }
// }

// export async function textToSpeech(text: string, lang: string) {
//   try {
//     const voice = supportedLanguages.find(l => l.code === lang)?.voice || 'en-us';
//     const response = await axios.get('https://api.voicerss.org/', {
//       params: {
//         key: VOICE_RSS_KEY,
//         hl: voice,
//         src: text,
//         c: 'MP3',
//         f: '16khz_16bit_stereo'
//       },
//       responseType: 'blob'
//     });
    
//     return URL.createObjectURL(response.data);
//   } catch (error) {
//     console.error('TTS error:', error);
//     throw error;
//   }
// }

import axios from 'axios';

const VOICE_RSS_KEY = 'c1a97dd1ded744e48d86ebb1e8ed368d';

export const supportedLanguages = [
  { code: 'en-US', name: 'English', voice: 'en-us' },
  { code: 'es-ES', name: 'Spanish', voice: 'es-es' },
  { code: 'de-DE', name: 'German', voice: 'de-de' },
  { code: 'fr-FR', name: 'French', voice: 'fr-fr' },
  { code: 'hi-IN', name: 'Hindi', voice: 'hi-in' },
];

export async function translateText(text: string, fromLang: string, toLang: string) {
  try {
    const from = fromLang.split('-')[0];
    const to = toLang.split('-')[0];
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    const translatedText = response.data[0]
      .map((item: any[]) => item[0])
      .join('');
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export async function textToSpeech(text: string, lang: string) {
  try {
    const voice = supportedLanguages.find(l => l.code === lang)?.voice || 'en-us';
    const response = await axios.get('https://api.voicerss.org/', {
      params: {
        key: VOICE_RSS_KEY,
        hl: voice,
        src: text,
        c: 'MP3',
        f: '16khz_16bit_stereo'
      },
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
}