// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { supportedLanguages, translateText, textToSpeech } from '@/lib/translation';
// import { Languages } from 'lucide-react';
// import { toast } from './ui/use-toast';
// import { Button } from './ui/button';

// const TranslationControls = () => {
//   const [sourceLang, setSourceLang] = useState('en-US');
//   const [targetLang, setTargetLang] = useState('de-DE');
//   const [isTranslating, setIsTranslating] = useState(false);
//   const recognitionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
//       setupSpeechRecognition();
//     }

//     return () => {
//       stopTranslation();
//     };
//   }, [sourceLang, targetLang]);

//   const setupSpeechRecognition = () => {
//     try {
//       const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
//       if (SpeechRecognition) {
//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.continuous = true;
//         recognitionRef.current.interimResults = true;
//         recognitionRef.current.lang = sourceLang;

//         recognitionRef.current.onstart = () => {
//           toast({
//             title: "Translation Active",
//             description: `Speaking in ${sourceLang}, translating to ${targetLang}`,
//           });
//         };

//         recognitionRef.current.onresult = async (event: any) => {
//           const transcript = Array.from(event.results)
//             .map((result: any) => result[0].transcript)
//             .join('');

//           if (event.results[event.results.length - 1].isFinal) {
//             try {
//               const translatedText = await translateText(transcript, sourceLang, targetLang);
//               console.log('Translated:', translatedText);
              
//               const audioUrl = await textToSpeech(translatedText, targetLang);
//               const audio = new Audio(audioUrl);
//               await audio.play();
//             } catch (error) {
//               console.error('Translation/TTS error:', error);
//               toast({
//                 title: "Error",
//                 description: "Translation failed. Please try again.",
//                 variant: "destructive"
//               });
//             }
//           }
//         };

//         recognitionRef.current.onerror = (event: any) => {
//           console.error('Recognition error:', event.error);
//           stopTranslation();
//         };
//       }
//     } catch (error) {
//       console.error('Speech recognition setup error:', error);
//     }
//   };

//   const startTranslation = async () => {
//     try {
//       mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//       recognitionRef.current?.start();
//       setIsTranslating(true);
//     } catch (error) {
//       console.error('Error starting translation:', error);
//       toast({
//         title: "Error",
//         description: "Could not access microphone",
//         variant: "destructive"
//       });
//     }
//   };

//   const stopTranslation = () => {
//     recognitionRef.current?.stop();
//     mediaStreamRef.current?.getTracks().forEach(track => track.stop());
//     setIsTranslating(false);
//   };

//   return (
//     <div className="flex flex-col gap-4 min-w-[200px]">
//       <div className="flex items-center justify-between">
//         <Languages className="h-5 w-5" />
//         <span className="text-sm font-medium">Translation Controls</span>
//       </div>

//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Speak in:</label>
//           <select
//             value={sourceLang}
//             onChange={(e) => setSourceLang(e.target.value)}
//             className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
//             disabled={isTranslating}
//           >
//             {supportedLanguages.map((lang) => (
//               <option key={lang.code} value={lang.code}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Translate to:</label>
//           <select
//             value={targetLang}
//             onChange={(e) => setTargetLang(e.target.value)}
//             className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
//             disabled={isTranslating}
//           >
//             {supportedLanguages.map((lang) => (
//               <option key={lang.code} value={lang.code}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <Button
//           onClick={isTranslating ? stopTranslation : startTranslation}
//           className={`w-full ${isTranslating ? 'bg-red-500' : 'bg-blue-500'}`}
//         >
//           {isTranslating ? 'Stop Translation' : 'Start Translation'}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default TranslationControls;


// working code 
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { supportedLanguages, translateText, textToSpeech } from '@/lib/translation';
// import { Languages } from 'lucide-react';
// import { toast } from './ui/use-toast';
// import { Button } from './ui/button';
// import { Call } from '@stream-io/video-react-sdk';

// const TranslationControls = ({ call }: { call: Call }) => {
//   const [sourceLang, setSourceLang] = useState('en-US');
//   const [targetLang, setTargetLang] = useState('de-DE');
//   const [isTranslating, setIsTranslating] = useState(false);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
//   const translatedStreamRef = useRef<MediaStream | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const originalAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

//   useEffect(() => {
//     const setupAudio = async () => {
//       try {
//         // Request microphone access
//         mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioContextRef.current = new AudioContext();
//         streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
//         translatedStreamRef.current = streamDestinationRef.current.stream;

//         // Connect original audio initially
//         originalAudioSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
//         originalAudioSourceRef.current.connect(streamDestinationRef.current);

//         // Publish the stream to the call
//         if (call && translatedStreamRef.current) {
//           await call.publishAudioStream(translatedStreamRef.current);
//           console.log('Audio stream published successfully');
//         }

//         setupSpeechRecognition();
//       } catch (error) {
//         console.error('Error setting up audio:', error);
//         toast({ title: 'Error', description: 'Could not access microphone. Please allow microphone access.', variant: 'destructive' });
//       }
//     };

//     setupAudio();

//     return () => {
//       stopTranslation();
//       mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
//       audioContextRef.current?.close();
//     };
//   }, [call]);
   
//   const setupSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       toast({ title: 'Error', description: 'Speech recognition not supported in this browser. Use Chrome for best results.', variant: 'destructive' });
//       return;
//     }

//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.lang = sourceLang;

//     recognitionRef.current.onstart = () => {
//       console.log('Speech recognition started');
//       toast({ title: 'Listening', description: `Speak in ${sourceLang} to translate to ${targetLang}` });
//     };

//     recognitionRef.current.onresult = async (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       if (event.results[event.results.length - 1].isFinal) {
//         console.log('Recognized speech:', transcript);
//         try {
//           const translatedText = await translateText(transcript, sourceLang, targetLang);
//           console.log('Translated text:', translatedText);
//           const audioUrl = await textToSpeech(translatedText, targetLang);
//           console.log('TTS audio URL:', audioUrl);

//           // Play translated audio into the stream
//           const audio = new Audio(audioUrl);
//           audio.oncanplay = () => {
//             const source = audioContextRef.current!.createMediaElementSource(audio);
//             source.connect(streamDestinationRef.current!);
//             audio.play();
//             console.log('Translated audio playing for other users');
//           };
//           audio.onerror = (e) => {
//             console.error('Audio playback error:', e);
//             toast({ title: 'Error', description: 'Failed to play translated audio.', variant: 'destructive' });
//           };
//         } catch (error) {
//           console.error('Translation/TTS error:', error);
//           toast({ title: 'Error', description: 'Translation failed. Check console for details.', variant: 'destructive' });
//         }
//       }
//     };

//     recognitionRef.current.onend = () => {
//       console.log('Speech recognition stopped');
//       if (isTranslating) {
//         recognitionRef.current?.start(); // Restart if still translating
//       }
//     };

//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error:', event.error);
//       if (event.error === 'no-speech') {
//         toast({ title: 'No Speech', description: 'No speech detected. Please speak clearly.', variant: 'default' });
//       } else {
//         stopTranslation();
//         toast({ title: 'Error', description: `Speech recognition failed: ${event.error}`, variant: 'destructive' });
//       }
//     };
//   };

//   const startTranslation = async () => {
//     if (!recognitionRef.current) {
//       toast({ title: 'Error', description: 'Speech recognition not initialized.', variant: 'destructive' });
//       return;
//     }

//     // Disconnect original audio
//     if (originalAudioSourceRef.current) {
//       originalAudioSourceRef.current.disconnect();
//       console.log('Original audio disconnected');
//     }
//     // Mute microphone to avoid sending raw audio
//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false));

//     try {
//       recognitionRef.current.start();
//       setIsTranslating(true);
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//       toast({ title: 'Error', description: 'Failed to start translation. Check microphone permissions.', variant: 'destructive' });
//     }
//   };

//   const stopTranslation = () => {
//     recognitionRef.current?.stop();
//     setIsTranslating(false);
//     // Reconnect original audio
//     if (originalAudioSourceRef.current && streamDestinationRef.current) {
//       originalAudioSourceRef.current.connect(streamDestinationRef.current);
//       console.log('Original audio reconnected');
//     }
//     // Unmute microphone
//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true));
//     toast({ title: 'Translation Stopped', description: 'Translation has been stopped.' });
//   };

//   return (
//     <div className="flex flex-col gap-4 min-w-[200px] text-white">
//       <div className="flex items-center justify-between">
//         <Languages className="h-5 w-5" />
//         <span className="text-sm font-medium">Translation Controls</span>
//       </div>
//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Speak in:</label>
//           <select
//             value={sourceLang}
//             onChange={(e) => setSourceLang(e.target.value)}
//             className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//             disabled={isTranslating}
//           >
//             {supportedLanguages.map((lang) => (
//               <option key={lang.code} value={lang.code}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Translate to:</label>
//           <select
//             value={targetLang}
//             onChange={(e) => setTargetLang(e.target.value)}
//             className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//             disabled={isTranslating}
//           >
//             {supportedLanguages.map((lang) => (
//               <option key={lang.code} value={lang.code}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <Button
//           onClick={isTranslating ? stopTranslation : startTranslation}
//           className={`w-full ${isTranslating ? 'bg-red-500' : 'bg-blue-500'}`}
//         >
//           {isTranslating ? 'Stop Translation' : 'Start Translation'}
//         </Button>
//       </div>
//     </div>
//   );

  

// };

// export default TranslationControls;


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { supportedLanguages, translateText, textToSpeech } from '@/lib/translation';
// import { Languages } from 'lucide-react';
// import { toast } from './ui/use-toast';
// import { Button } from './ui/button';
// import { Call } from '@stream-io/video-react-sdk';

// const TranslationWithToggle = ({ call }: { call: Call }) => {
//   const [showTranslator, setShowTranslator] = useState(false);
//   const [sourceLang, setSourceLang] = useState('en-US');
//   const [targetLang, setTargetLang] = useState('de-DE');
//   const [isTranslating, setIsTranslating] = useState(false);

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
//   const translatedStreamRef = useRef<MediaStream | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const originalAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

//   useEffect(() => {
//     const setupAudio = async () => {
//       try {
//         mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioContextRef.current = new AudioContext();
//         streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
//         translatedStreamRef.current = streamDestinationRef.current.stream;

//         originalAudioSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
//         originalAudioSourceRef.current.connect(streamDestinationRef.current);

//         if (call && translatedStreamRef.current) {
//           await call.publishAudioStream(translatedStreamRef.current);
//           console.log('Audio stream published successfully');
//         }

//         setupSpeechRecognition();
//       } catch (error) {
//         console.error('Error setting up audio:', error);
//         toast({
//           title: 'Error',
//           description: 'Could not access microphone. Please allow microphone access.',
//           variant: 'destructive',
//         });
//       }
//     };

//     setupAudio();
 
    
//     return () => {
//       stopTranslation();
//       mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
//       audioContextRef.current?.close();
//     };
//   }, [call]);
//   useEffect(() => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//     }
  
//     setupSpeechRecognition(); // recreate with new language
//   }, [sourceLang]);
//   const setupSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       toast({
//         title: 'Error',
//         description: 'Speech recognition not supported in this browser. Use Chrome for best results.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.lang = sourceLang;

//     recognitionRef.current.onstart = () => {
//       console.log('Speech recognition started');
//       toast({ title: 'Listening', description: `Speak in ${sourceLang} to translate to ${targetLang}` });
//     };

//     recognitionRef.current.onresult = async (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       if (event.results[event.results.length - 1].isFinal) {
//         console.log('Recognized speech:', transcript);
//         try {
//           console.log('From:', sourceLang, '| To:', targetLang);

//           const translatedText = await translateText(transcript, sourceLang, targetLang);
//           console.log('Translated text:', translatedText);
//           const audioUrl = await textToSpeech(translatedText, targetLang);
//           console.log('TTS audio URL:', audioUrl);

//           const audio = new Audio(audioUrl);
//           audio.oncanplay = () => {
//             const source = audioContextRef.current!.createMediaElementSource(audio);
//             source.connect(streamDestinationRef.current!);
//             audio.play();
//             console.log('Translated audio playing for other users');
//           };
//           audio.onerror = (e) => {
//             console.error('Audio playback error:', e);
//             toast({
//               title: 'Error',
//               description: 'Failed to play translated audio.',
//               variant: 'destructive',
//             });
//           };
//         } catch (error) {
//           console.error('Translation/TTS error:', error);
//           toast({
//             title: 'Error',
//             description: 'Translation failed. Check console for details.',
//             variant: 'destructive',
//           });
//         }
//       }
//     };

//     recognitionRef.current.onend = () => {
//       console.log('Speech recognition stopped');
//       if (isTranslating) {
//         recognitionRef.current?.start();
//       }
//     };

//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error:', event.error);
//       if (event.error === 'no-speech') {
//         toast({ title: 'No Speech', description: 'No speech detected. Please speak clearly.', variant: 'default' });
//       } else {
//         stopTranslation();
//         toast({
//           title: 'Error',
//           description: `Speech recognition failed: ${event.error}`,
//           variant: 'destructive',
//         });
//       }
//     };
//   };

//   const startTranslation = async () => {
//     if (!recognitionRef.current) {
//       toast({ title: 'Error', description: 'Speech recognition not initialized.', variant: 'destructive' });
//       return;
//     }

//     if (originalAudioSourceRef.current) {
//       originalAudioSourceRef.current.disconnect();
//       console.log('Original audio disconnected');
//     }

//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false));

//     try {
//       recognitionRef.current.start();
//       setIsTranslating(true);
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to start translation. Check microphone permissions.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const stopTranslation = () => {
//     recognitionRef.current?.stop();
//     setIsTranslating(false);

//     if (originalAudioSourceRef.current && streamDestinationRef.current) {
//       originalAudioSourceRef.current.connect(streamDestinationRef.current);
//       console.log('Original audio reconnected');
//     }

//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true));
//     toast({ title: 'Translation Stopped', description: 'Translation has been stopped.' });
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <Button
//         onClick={() => setShowTranslator((prev) => !prev)}
//         className={`w-full ${showTranslator ? 'bg-red-600' : 'bg-green-600'}`}
//       >
//         {showTranslator ? 'Close Translator' : 'Open Translator'}
//       </Button>

//       {showTranslator && (
//         <div className="mt-4 bg-gray-900 p-4 rounded-md shadow-lg min-w-[250px] text-white">
//           <div className="flex flex-col gap-4">
//             <div className="flex items-center justify-between">
//               <Languages className="h-5 w-5" />
//               <span className="text-sm font-medium">Translation Controls</span>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Speak in:</label>
//                 <select
//                   value={sourceLang}
//                   onChange={(e) => setSourceLang(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//                   disabled={isTranslating}
//                 >
//                   {supportedLanguages.map((lang) => (
//                     <option key={lang.code} value={lang.code}>
//                       {lang.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Translate to:</label>
//                 <select
//                   value={targetLang}
//                   onChange={(e) => setTargetLang(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//                   disabled={isTranslating}
//                 >
//                   {supportedLanguages.map((lang) => (
//                     <option key={lang.code} value={lang.code}>
//                       {lang.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <Button
//                 onClick={isTranslating ? stopTranslation : startTranslation}
//                 className={`w-full ${isTranslating ? 'bg-red-500' : 'bg-blue-500'}`}
//               >
//                 {isTranslating ? 'Stop Translation' : 'Start Translation'}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TranslationWithToggle;



// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 
// workign code =====------------------------------- 



// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { supportedLanguages, translateText, textToSpeech } from '@/lib/translation';
// import { Languages } from 'lucide-react';
// import { toast } from './ui/use-toast';
// import { Button } from './ui/button';
// import { Call } from '@stream-io/video-react-sdk';

// const TranslationWithToggle = ({ call }: { call: Call }) => {
//   const [showTranslator, setShowTranslator] = useState(false);
//   const [sourceLang, setSourceLang] = useState('en-US');
//   const [targetLang, setTargetLang] = useState('de-DE');
//   const [isTranslating, setIsTranslating] = useState(false);

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
//   const translatedStreamRef = useRef<MediaStream | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const originalAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

//   // NEW: Refs to hold current language values
//   const sourceLangRef = useRef(sourceLang);
//   const targetLangRef = useRef(targetLang);

//   // Sync refs with current state
//   useEffect(() => {
//     sourceLangRef.current = sourceLang;
//   }, [sourceLang]);

//   useEffect(() => {
//     targetLangRef.current = targetLang;
//   }, [targetLang]);

//   useEffect(() => {
//     const setupAudio = async () => {
//       try {
//         mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioContextRef.current = new AudioContext();
//         streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
//         translatedStreamRef.current = streamDestinationRef.current.stream;

//         originalAudioSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
//         originalAudioSourceRef.current.connect(streamDestinationRef.current);

//         if (call && translatedStreamRef.current) {
//           await call.publishAudioStream(translatedStreamRef.current);
//           console.log('Audio stream published successfully');
//         }

//         setupSpeechRecognition();
//       } catch (error) {
//         console.error('Error setting up audio:', error);
//         toast({
//           title: 'Error',
//           description: 'Could not access microphone. Please allow microphone access.',
//           variant: 'destructive',
//         });
//       }
//     };

//     setupAudio();

//     return () => {
//       stopTranslation();
//       mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
//       audioContextRef.current?.close();
//     };
//   }, [call]);

//   useEffect(() => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//     }

//     setupSpeechRecognition(); // recreate with new language
//   }, [sourceLang, targetLang]);

//   const setupSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       toast({
//         title: 'Error',
//         description: 'Speech recognition not supported in this browser. Use Chrome for best results.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.lang = sourceLangRef.current;

//     recognitionRef.current.onstart = () => {
//       console.log('Speech recognition started');
//       toast({ title: 'Listening', description: `Speak in ${sourceLangRef.current} to translate to ${targetLangRef.current}` });
//     };

//     recognitionRef.current.onresult = async (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       if (event.results[event.results.length - 1].isFinal) {
//         console.log('Recognized speech:', transcript);
//         try {
//           console.log('From:', sourceLangRef.current, '| To:', targetLangRef.current);

//           const translatedText = await translateText(transcript, sourceLangRef.current, targetLangRef.current);
//           console.log('Translated text:', translatedText);
//           const audioUrl = await textToSpeech(translatedText, targetLangRef.current);
//           console.log('TTS audio URL:', audioUrl);

//           const audio = new Audio(audioUrl);
//           audio.oncanplay = () => {
//             const source = audioContextRef.current!.createMediaElementSource(audio);
//             source.connect(streamDestinationRef.current!);
//             audio.play();
//             console.log('Translated audio playing for other users');
//           };
//           audio.onerror = (e) => {
//             console.error('Audio playback error:', e);
//             toast({
//               title: 'Error',
//               description: 'Failed to play translated audio.',
//               variant: 'destructive',
//             });
//           };
//         } catch (error) {
//           console.error('Translation/TTS error:', error);
//           toast({
//             title: 'Error',
//             description: 'Translation failed. Check console for details.',
//             variant: 'destructive',
//           });
//         }
//       }
//     };

//     recognitionRef.current.onend = () => {
//       console.log('Speech recognition stopped');
//       if (isTranslating) {
//         recognitionRef.current?.start();
//       }
//     };

//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error:', event.error);
//       if (event.error === 'no-speech') {
//         toast({ title: 'No Speech', description: 'No speech detected. Please speak clearly.', variant: 'default' });
//       } else {
//         stopTranslation();
//         toast({
//           title: 'Error',
//           description: `Speech recognition failed: ${event.error}`,
//           variant: 'destructive',
//         });
//       }
//     };
//   };

//   const startTranslation = async () => {
//     if (!recognitionRef.current) {
//       toast({ title: 'Error', description: 'Speech recognition not initialized.', variant: 'destructive' });
//       return;
//     }

//     if (originalAudioSourceRef.current) {
//       originalAudioSourceRef.current.disconnect();
//       console.log('Original audio disconnected');
//     }

//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false));

//     try {
//       recognitionRef.current.start();
//       setIsTranslating(true);
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to start translation. Check microphone permissions.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const stopTranslation = () => {
//     recognitionRef.current?.stop();
//     setIsTranslating(false);

//     if (originalAudioSourceRef.current && streamDestinationRef.current) {
//       originalAudioSourceRef.current.connect(streamDestinationRef.current);
//       console.log('Original audio reconnected');
//     }

//     mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true));
//     toast({ title: 'Translation Stopped', description: 'Translation has been stopped.' });
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <Button
//         onClick={() => setShowTranslator((prev) => !prev)}
//         className={`w-full ${showTranslator ? 'bg-red-600' : 'bg-green-600'}`}
//       >
//         {showTranslator ? 'Close Translator' : 'Open Translator'}
//       </Button>

//       {showTranslator && (
//         <div className="mt-4 bg-gray-900 p-4 rounded-md shadow-lg min-w-[250px] text-white">
//           <div className="flex flex-col gap-4">
//             <div className="flex items-center justify-between">
//               <Languages className="h-5 w-5" />
//               <span className="text-sm font-medium">Translation Controls</span>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Speak in:</label>
//                 <select
//                   value={sourceLang}
//                   onChange={(e) => setSourceLang(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//                   disabled={isTranslating}
//                 >
//                   {supportedLanguages.map((lang) => (
//                     <option key={lang.code} value={lang.code}>
//                       {lang.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Translate to:</label>
//                 <select
//                   value={targetLang}
//                   onChange={(e) => setTargetLang(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
//                   disabled={isTranslating}
//                 >
//                   {supportedLanguages.map((lang) => (
//                     <option key={lang.code} value={lang.code}>
//                       {lang.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <Button
//                 onClick={isTranslating ? stopTranslation : startTranslation}
//                 className={`w-full ${isTranslating ? 'bg-red-500' : 'bg-blue-500'}`}
//               >
//                 {isTranslating ? 'Stop Translation' : 'Start Translation'}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TranslationWithToggle;




//  new working code ====---------------------
//  new working code ====---------------------
//  new working code ====---------------------
//  new working code ====---------------------
//  new working code ====---------------------
'use client';

import { useState, useEffect, useRef } from 'react';
import { supportedLanguages, translateText, textToSpeech } from '@/lib/translation';
import { Languages } from 'lucide-react';
import { toast } from './ui/use-toast';
import { Button } from './ui/button';
import { Call } from '@stream-io/video-react-sdk';

const TranslationWithToggle = ({ call }: { call: Call }) => {
  const [showTranslator, setShowTranslator] = useState(false);
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLang, setTargetLang] = useState('de-DE');
  const [isTranslating, setIsTranslating] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const translatedStreamRef = useRef<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const originalAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const sourceLangRef = useRef(sourceLang);
  const targetLangRef = useRef(targetLang);

  useEffect(() => {
    sourceLangRef.current = sourceLang;
  }, [sourceLang]);

  useEffect(() => {
    targetLangRef.current = targetLang;
  }, [targetLang]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
        translatedStreamRef.current = streamDestinationRef.current.stream;

        originalAudioSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        originalAudioSourceRef.current.connect(streamDestinationRef.current);

        if (call && translatedStreamRef.current) {
          await call.publishAudioStream(translatedStreamRef.current);
          console.log('Audio stream published successfully');
        }

        setupSpeechRecognition();
      } catch (error) {
        console.error('Error setting up audio:', error);
        toast({
          title: 'Error',
          description: 'Could not access microphone. Please allow microphone access.',
          variant: 'destructive',
        });
      }
    };

    setupAudio();

    return () => {
      stopTranslation();
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, [call]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setupSpeechRecognition();
  }, [sourceLang, targetLang]);

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Error',
        description: 'Speech recognition not supported in this browser. Use Chrome for best results.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = sourceLangRef.current;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      toast({
        title: 'Listening',
        description: `Speak in ${sourceLangRef.current} to translate to ${targetLangRef.current}`,
      });
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (event.results[event.results.length - 1].isFinal) {
        console.log('Recognized speech:', transcript);
        try {
          const translatedText = await translateText(transcript, sourceLangRef.current, targetLangRef.current);
          console.log('Translated:', translatedText);
          const audioUrl = await textToSpeech(translatedText, targetLangRef.current);

          const audio = new Audio(audioUrl);
          audio.oncanplay = () => {
            const source = audioContextRef.current!.createMediaElementSource(audio);
            source.connect(streamDestinationRef.current!);
            audio.play();
            console.log('Translated audio played');
          };

          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            toast({
              title: 'Error',
              description: 'Failed to play translated audio.',
              variant: 'destructive',
            });
          };
        } catch (error) {
          console.error('Translation/TTS error:', error);
          toast({
            title: 'Error',
            description: 'Translation failed.',
            variant: 'destructive',
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        toast({ title: 'No Speech', description: 'No speech detected. Try again.' });
      } else {
        stopTranslation();
        toast({
          title: 'Error',
          description: `Speech recognition failed: ${event.error}`,
          variant: 'destructive',
        });
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isTranslating) {
        console.log('Restarting recognition...');
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      }
    };

    recognitionRef.current = recognition;
  };

  const startTranslation = async () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Error',
        description: 'Speech recognition not initialized.',
        variant: 'destructive',
      });
      return;
    }

    if (originalAudioSourceRef.current) {
      originalAudioSourceRef.current.disconnect();
      console.log('Original audio disconnected');
    }

    mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false));

    try {
      recognitionRef.current.start();
      setIsTranslating(true);
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast({
        title: 'Error',
        description: 'Failed to start speech recognition.',
        variant: 'destructive',
      });
    }
  };

  const stopTranslation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Recognition stop failed:', e);
      }
    }
    setIsTranslating(false);

    if (originalAudioSourceRef.current && streamDestinationRef.current) {
      originalAudioSourceRef.current.connect(streamDestinationRef.current);
    }

    mediaStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true));
    toast({ title: 'Translation Stopped', description: 'Translation has been stopped.' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowTranslator((prev) => !prev)}
        className={`w-full ${showTranslator ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {showTranslator ? 'Close Translator' : 'Open Translator'}
      </Button>

      {showTranslator && (
        <div className="mt-4 bg-gray-900 p-4 rounded-md shadow-lg min-w-[250px] text-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Languages className="h-5 w-5" />
              <span className="text-sm font-medium">Translation Controls</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speak in:</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
                  disabled={isTranslating}
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Translate to:</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-dark-1 px-3 py-2 text-sm text-white"
                  disabled={isTranslating}
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={isTranslating ? stopTranslation : startTranslation}
                className={`w-full ${isTranslating ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                {isTranslating ? 'Stop Translation' : 'Start Translation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationWithToggle;
