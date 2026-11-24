import test from 'node:test';
import assert from 'node:assert';
import { extractInformation, validateField, normalizeNumbers } from '../src/services/conversationEngine.js';

test('Name extraction with Hindi conversational introductory phrases', () => {
  const t1 = extractInformation('मेरा नाम लोकेश शर्मा है', 'name');
  assert.strictEqual(t1.extracted.name, 'लोकेश शर्मा');

  const t2 = extractInformation('मेरा नाम विकास है', 'name');
  assert.strictEqual(t2.extracted.name, 'विकास', 'Must not strip "का" from Vikas');

  const t3 = extractInformation('मेरा नाम आकाश है', 'name');
  assert.strictEqual(t3.extracted.name, 'आकाश', 'Must not strip "का" from Akash');

  const t4 = extractInformation('मेरा नाम दीपिका है', 'name');
  assert.strictEqual(t4.extracted.name, 'दीपिका', 'Must not strip "का" from Deepika');

  const t5 = extractInformation('मेरा नाम मनीष है', 'name');
  assert.strictEqual(t5.extracted.name, 'मनीष');
});

test('Name extraction with English conversational phrases', () => {
  const t1 = extractInformation('My name is Manish', 'name');
  assert.strictEqual(t1.extracted.name, 'Manish', 'Must not strip "is" from Manish');

  const t2 = extractInformation('My name is Vishal Kishore', 'name');
  assert.strictEqual(t2.extracted.name, 'Vishal Kishore', 'Must not strip "is" from Vishal or Kishore');

  const t3 = extractInformation('lokesh sharma', 'name');
  assert.strictEqual(t3.extracted.name, 'Lokesh Sharma');
});

test('Location extraction with Devanagari variations and particles', () => {
  const t1 = extractInformation('मेरा गाँव रामपुर है', 'location');
  assert.strictEqual(t1.extracted.location, 'रामपुर', 'Supports candrabindu गाँव');

  const t2 = extractInformation('मेरा गांव रामपुर है', 'location');
  assert.strictEqual(t2.extracted.location, 'रामपुर', 'Supports bindi गांव');

  const t3 = extractInformation('गाँव का नाम बिठूर है', 'location');
  assert.strictEqual(t3.extracted.location, 'बिठूर');

  const t4 = extractInformation('रामपुर से हूँ', 'location');
  assert.strictEqual(t4.extracted.location, 'रामपुर');

  const t5 = extractInformation('ग्राम रामपुर', 'location');
  assert.strictEqual(t5.extracted.location, 'रामपुर');

  const t6 = extractInformation('मऊ', 'location');
  assert.strictEqual(t6.extracted.location, 'मऊ', 'Supports 2-letter locations');
});

test('Location extraction with English phrases', () => {
  const t1 = extractInformation('I live in Kalyanpur', 'location');
  assert.strictEqual(t1.extracted.location, 'Kalyanpur');

  const t2 = extractInformation('rampur village', 'location');
  assert.strictEqual(t2.extracted.location, 'Rampur');
});

test('Phone number extraction across formats and languages', () => {
  // 1. Standard 10-digit number
  const t1 = extractInformation('9876543210', 'phone');
  assert.strictEqual(t1.extracted.phone, '9876543210');

  // 2. Spoken with spaces between numbers
  const t2 = extractInformation('98 76 54 32 10', 'phone');
  assert.strictEqual(t2.extracted.phone, '9876543210');

  // 3. Devanagari numerals
  const t3 = extractInformation('९८७६५४३२१०', 'phone');
  assert.strictEqual(t3.extracted.phone, '9876543210');

  // 4. Gujarati numerals
  const t4 = extractInformation('૯૮૭૬૫૪૩૨૧૦', 'phone');
  assert.strictEqual(t4.extracted.phone, '9876543210');

  // 5. Country code +91 prefix
  const t5 = extractInformation('मेरा मोबाइल नंबर है +91 9876543210', 'phone');
  assert.strictEqual(t5.extracted.phone, '9876543210');

  // 6. Trunk 0 prefix (11 digits)
  const t6 = extractInformation('09876543210', 'phone');
  assert.strictEqual(t6.extracted.phone, '9876543210');

  // 7. Spoken in Hindi 2-digit pairs
  const t7 = extractInformation('मेरा नंबर है अट्ठानवे बहत्तर पैंतालीस इकसठ बीस', 'phone');
  assert.strictEqual(t7.extracted.phone, '9872456120');

  // 8. Spoken in Hindi single digits
  const t8 = extractInformation('नौ आठ सात छह पांच चार तीन दो एक शून्य', 'phone');
  assert.strictEqual(t8.extracted.phone, '9876543210');

  // 9. Spoken in English words
  const t9 = extractInformation('nine eight seven six five four three two one zero', 'phone');
  assert.strictEqual(t9.extracted.phone, '9876543210');

  // 10. Spoken with English multiplier "double"
  const t10 = extractInformation('double nine eight seven six five four three two one', 'phone');
  assert.strictEqual(t10.extracted.phone, '9987654321');
});

test('Strict cross-field isolation prevents pollution', () => {
  // When at location step, speaking village name MUST NOT set name
  const t1 = extractInformation('रामपुर', 'location');
  assert.strictEqual(t1.extracted.location, 'रामपुर');
  assert.strictEqual(t1.extracted.name, undefined);

  // When at name step, speaking name MUST NOT set location
  const t2 = extractInformation('लोकेश शर्मा', 'name');
  assert.strictEqual(t2.extracted.name, 'लोकेश शर्मा');
  assert.strictEqual(t2.extracted.location, undefined);

  // When at phone step, reciting phone pairs MUST NOT set age or name
  const t3 = extractInformation('98 72 45 61 20', 'phone');
  assert.strictEqual(t3.extracted.phone, '9872456120');
  assert.strictEqual(t3.extracted.age, undefined, 'Phone numbers must not pollute age field');
  assert.strictEqual(t3.extracted.name, undefined);
  assert.strictEqual(t3.extracted.location, undefined);
});

test('Age extraction with Hindi words and Devanagari numerals', () => {
  const t1 = extractInformation('पच्चीस साल', 'age');
  assert.strictEqual(t1.extracted.age, '25');

  const t2 = extractInformation('मेरी उम्र ३० साल है', 'age');
  assert.strictEqual(t2.extracted.age, '30');

  const t3 = extractInformation('45', 'age');
  assert.strictEqual(t3.extracted.age, '45');
});

test('Field validation rules', () => {
  assert.strictEqual(validateField('name', 'लोकेश'), true);
  assert.strictEqual(validateField('name', 'L'), false);
  assert.strictEqual(validateField('location', 'मऊ'), true);
  assert.strictEqual(validateField('location', ' '), false);
  assert.strictEqual(validateField('age', '25'), true);
  assert.strictEqual(validateField('age', '150'), false);
  assert.strictEqual(validateField('gender', 'Male'), true);
  assert.strictEqual(validateField('gender', 'Female'), true);
  assert.strictEqual(validateField('gender', 'Alien'), false);
  assert.strictEqual(validateField('phone', '9876543210'), true);
  assert.strictEqual(validateField('phone', '987654321'), false, 'Rejects 9 digits');
  assert.strictEqual(validateField('phone', '98765432101'), false, 'Rejects 11 digits');
});
