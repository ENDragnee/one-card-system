// lib/barcodeGenerator.ts
export function generateBarcode(): string {
    // Generate a random 12-digit number
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    
    // Add a check digit (simple implementation)
    let sum = 0;
    for (let i = 0; i < random.length; i++) {
      sum += parseInt(random[i]) * (i % 2 === 0 ? 3 : 1);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return random + checkDigit;
  }