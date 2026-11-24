import test from 'node:test';
import assert from 'node:assert';
import { detectLanguageFromTranscript, SUPPORTED_LANGUAGES } from '../src/services/languageDetection.js';

test('Direct language name detection across languages', () => {
  // Hindi
  assert.strictEqual(detectLanguageFromTranscript('Hindi')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('हिंदी')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('हिन्दी में')?.language, 'hi-IN');

  // English
  assert.strictEqual(detectLanguageFromTranscript('English')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('In English, please.')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('अंग्रेजी')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('इंग्लिश')?.language, 'en-US');

  // Marathi
  assert.strictEqual(detectLanguageFromTranscript('Marathi')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मराठी')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मराठी मध्ये')?.language, 'mr-IN');

  // Gujarati
  assert.strictEqual(detectLanguageFromTranscript('Gujarati')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('ગુજરાતી')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('गुजराती')?.language, 'gu-IN');

  // Telugu
  assert.strictEqual(detectLanguageFromTranscript('Telugu')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('తెలుగు')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('तेलुगु')?.language, 'te-IN');
});

test('Script and conversational phrase detection', () => {
  // Hindi phrase
  assert.strictEqual(detectLanguageFromTranscript('मेरा नाम लोकेश है')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('मुझे बुखार है')?.language, 'hi-IN');

  // Marathi phrase in Devanagari (distinguished from Hindi)
  assert.strictEqual(detectLanguageFromTranscript('माझे नाव लोकेश आहे')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मला ताप आला आहे')?.language, 'mr-IN');

  // Gujarati script
  assert.strictEqual(detectLanguageFromTranscript('મારું નામ લોકેશ છે')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('મને તાવ છે')?.language, 'gu-IN');

  // Telugu script
  assert.strictEqual(detectLanguageFromTranscript('నా పేరు లోకేష్')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('నాకు ఆరోగ్యం బాగాలేదు')?.language, 'te-IN');

  // English sentence
  assert.strictEqual(detectLanguageFromTranscript('Hello doctor, I have a fever')?.language, 'en-US');
});

test('Romanized greetings and phrases', () => {
  assert.strictEqual(detectLanguageFromTranscript('kem cho')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('namaskaram')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('namaste mera naam')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('majhe naav aahe')?.language, 'mr-IN');
});

test('Empty or invalid input handling', () => {
  assert.strictEqual(detectLanguageFromTranscript(''), null);
  assert.strictEqual(detectLanguageFromTranscript('   '), null);
  assert.strictEqual(detectLanguageFromTranscript(null), null);
  assert.strictEqual(detectLanguageFromTranscript('12345')?.language, 'unknown');
});

test('Supported languages configuration integrity', () => {
  assert.strictEqual(SUPPORTED_LANGUAGES.length, 5);
  const codes = SUPPORTED_LANGUAGES.map(l => l.code);
  assert.deepStrictEqual(codes, ['hi-IN', 'en-US', 'gu-IN', 'te-IN', 'mr-IN']);
});
