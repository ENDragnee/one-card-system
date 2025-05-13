export interface IdCardProps {
  photoUrl?: string;
  fullName: string;
  university?: string;
  role?: string;
  idNumber: string;
  phone: string;
  barcodeValue?: string;
  honor?: string;
}

// Example usage array for multiple cards
export interface IdCardsData {
  cards: IdCardProps[];
}

// Utility functions
export const validateIdCard = (card: IdCardProps): boolean => {
  if (!card.fullName || !card.idNumber || !card.phone) {
    return false;
  }
  
  // Phone number validation (Ethiopian format)
  const phoneRegex = /^\+251[0-9]{9}$/;
  if (!phoneRegex.test(card.phone)) {
    return false;
  }

  // ID number format validation (customize as needed)
  const idRegex = /^[A-Z]{3}\/\d{3}\/\d{2}$/;
  if (!idRegex.test(card.idNumber)) {
    return false;
  }

  return true;
};

export const formatPhoneNumber = (phone: string): string => {
  // Format phone number for display
  if (phone.startsWith('+251')) {
    return phone.replace(/(\+251)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
};

export const generateBarcodeValue = (idNumber: string): string => {
  // Generate unique barcode value based on ID number
  return `USAE${idNumber.replace(/[^0-9]/g, '')}`;
};