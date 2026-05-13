export const SERVICE_AREAS = [
  { id: 'kitchen', label: 'Kitchen', nepali: 'भान्सा', emoji: '🍳', color: '#E8744A' },
  { id: 'dining', label: 'Dining Hall', nepali: 'भोजन कक्ष', emoji: '🍽', color: '#D4A020' },
  { id: 'dhamma', label: 'Dhamma Hall', nepali: 'ध्यान कक्ष', emoji: '🔔', color: '#7B5EA6' },
  { id: 'compound', label: 'Compound', nepali: 'परिसर', emoji: '🌿', color: '#4A7A58' },
  { id: 'reception', label: 'Registration', nepali: 'दर्ता', emoji: '📋', color: '#2A6496' },
  { id: 'at_assist', label: 'AT Assistant', nepali: 'सहायक शिक्षक', emoji: '🧘', color: '#8B4A00' },
  {
    id: 'manager',
    label: 'Manager Asst.',
    nepali: 'व्यवस्थापक सहायक',
    emoji: '📊',
    color: '#5A3A8A',
  },
  { id: 'residence', label: 'Residence', nepali: 'आवास क्षेत्र', emoji: '🏡', color: '#3A7A6A' },
] as const;

export type ServiceAreaId = (typeof SERVICE_AREAS)[number]['id'];
