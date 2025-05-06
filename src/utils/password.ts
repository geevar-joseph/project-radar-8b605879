
/**
 * Generates a secure random password with the specified length
 * that includes uppercase, lowercase, numbers, and special characters
 */
export const generateSecurePassword = (length: number = 12): string => {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding confusable characters like I and O
  const lowercaseChars = 'abcdefghijkmnpqrstuvwxyz'; // Excluding l and o for readability
  const numberChars = '23456789'; // Excluding 0 and 1 for readability
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Ensure at least one of each character type
  let password = '';
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the rest of the password length with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password characters
  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  
  return password;
};
