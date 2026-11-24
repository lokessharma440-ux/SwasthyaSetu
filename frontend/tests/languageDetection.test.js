import test from 'node:test';
import assert from 'node:assert';
import { detectLanguageFromTranscript, SUPPORTED_LANGUAGES } from '../src/services/languageDetection.js';

test('Direct language name detection across languages', () => {
  // English
  assert.strictEqual(detectLanguageFromTranscript('English')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('english')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('In English, please.')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('speak english')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('अंग्रेजी')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('इंग्लिश')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('इंगलिश')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('अंगरेजी')?.language, 'en-US');

  // Hindi
  assert.strictEqual(detectLanguageFromTranscript('Hindi')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('hindi')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('हिंदी')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('हिन्दी में')?.language, 'hi-IN');

  // Marathi (Critical: must NOT be detected as en-US!)
  assert.strictEqual(detectLanguageFromTranscript('Marathi')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('marathi')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('marati')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मराठी')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मराठी मध्ये')?.language, 'mr-IN');

  // Gujarati
  assert.strictEqual(detectLanguageFromTranscript('Gujarati')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('gujarati')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('ગુજરાતી')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('गुजराती')?.language, 'gu-IN');

  // Telugu
  assert.strictEqual(detectLanguageFromTranscript('Telugu')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('telugu')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('తెలుగు')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('तेलुगु')?.language, 'te-IN');
});

test('Script and conversational phrase detection', () => {
  // English sentences
  assert.strictEqual(detectLanguageFromTranscript('Hello')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('Hi')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('Hello doctor, I have a fever')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('My name is John')?.language, 'en-US');
  assert.strictEqual(detectLanguageFromTranscript('I need help')?.language, 'en-US');

  // Hindi phrases
  assert.strictEqual(detectLanguageFromTranscript('मेरा नाम लोकेश है')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('मुझे बुखार है')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('mera naam Lokesh hai')?.language, 'hi-IN');
  assert.strictEqual(detectLanguageFromTranscript('namaste mera naam')?.language, 'hi-IN');

  // Marathi phrases (distinguished from Hindi)
  assert.strictEqual(detectLanguageFromTranscript('माझे नाव लोकेश आहे')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('मला ताप आला आहे')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('majhe naav Lokesh aahe')?.language, 'mr-IN');
  assert.strictEqual(detectLanguageFromTranscript('mala tap ahe')?.language, 'mr-IN');

  // Gujarati script & phrases
  assert.strictEqual(detectLanguageFromTranscript('મારું નામ લોકેશ છે')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('મને તાવ છે')?.language, 'gu-IN');
  assert.strictEqual(detectLanguageFromTranscript('kem cho')?.language, 'gu-IN');

  // Telugu script & phrases
  assert.strictEqual(detectLanguageFromTranscript('నా పేరు లోకేష్')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('నాకు ఆరోగ్యం బాగాలేదు')?.language, 'te-IN');
  assert.strictEqual(detectLanguageFromTranscript('namaskaram')?.language, 'te-IN');
});

test('Unrecognized or random Latin text must return unknown, NEVER en-US', () => {
  assert.strictEqual(detectLanguageFromTranscript('')?.language, undefined);
  assert.strictEqual(detectLanguageFromTranscript('   ')?.language, undefined);
  assert.strictEqual(detectLanguageFromTranscript(null), null);
  assert.strictEqual(detectLanguageFromTranscript('12345')?.language, 'unknown');
  assert.strictEqual(detectLanguageFromTranscript('xyz qwerty bla bla')?.language, 'unknown');
  assert.strictEqual(detectLanguageFromTranscript('asdfghjk')?.language, 'unknown');
});

test('Supported languages configuration integrity', () => {
  assert.strictEqual(SUPPORTED_LANGUAGES.length, 5);
  const codes = SUPPORTED_LANGUAGES.map(l => l.code);
  assert.deepStrictEqual(codes, ['hi-IN', 'en-US', 'gu-IN', 'te-IN', 'mr-IN']);
});
