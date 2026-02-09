export const LANGUAGES = [
  { value: 'english', code: 'en', label: 'English', prompt: 'Respond in English' },
  { value: 'hindi', code: 'hi', label: 'हिन्दी (Hindi)', prompt: 'Respond in Hindi language' },
  { value: 'tamil', code: 'ta', label: 'தமிழ் (Tamil)', prompt: 'Respond in Tamil language' },
  { value: 'telugu', code: 'te', label: 'తెలుగు (Telugu)', prompt: 'Respond in Telugu language' },
  { value: 'kannada', code: 'kn', label: 'ಕನ್ನಡ (Kannada)', prompt: 'Respond in Kannada language' },
  { value: 'bengali', code: 'bn', label: 'বাংলা (Bengali)', prompt: 'Respond in Bengali language' },
  { value: 'marathi', code: 'mr', label: 'मराठी (Marathi)', prompt: 'Respond in Marathi language' },
  { value: 'gujarati', code: 'gu', label: 'ગુજરાતી (Gujarati)', prompt: 'Respond in Gujarati language' },
  { value: 'malayalam', code: 'ml', label: 'മലയാളം (Malayalam)', prompt: 'Respond in Malayalam language' },
  { value: 'punjabi', code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', prompt: 'Respond in Punjabi language' },
  { value: 'odia', code: 'or', label: 'ଓଡ଼ିଆ (Odia)', prompt: 'Respond in Odia language' },
] as const;

export type LanguageValue = typeof LANGUAGES[number]['value'];

export const getLanguageByValue = (value: string) =>
  LANGUAGES.find(l => l.value === value) || LANGUAGES[0];
