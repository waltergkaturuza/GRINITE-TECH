// SERTIS-style project form constants for Granite Tech

export const PROJECT_CATEGORIES = [
  'Child protection',
  'Climate Action',
  'Disaster and Emergency Preparedness',
  'Drug and Substance Abuse',
  'Education',
  'Empowerment and Livelihoods',
  'Maternal Health',
  'Mental Health',
  'Non-Communicable diseases',
  'SRHR',
  'Technology & Innovation',
  'Digital Transformation',
  'Business Automation',
]

export const EVALUATION_FREQUENCY = [
  { value: 'midterm', label: 'Midterm' },
  { value: 'endterm', label: 'Endterm' },
  { value: 'annual', label: 'Annual' },
  { value: 'other', label: 'Other' },
]

export const METHODOLOGIES = [
  { value: 'narrative', label: 'Narrative' },
  { value: 'financial', label: 'Financial' },
  { value: 'log_frame', label: 'Log frame' },
  { value: 'visibility', label: 'Visibility' },
  { value: 'other', label: 'Other' },
]

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Democratic Republic of Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea',
  'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
]

export const ZIMBABWE_PROVINCES = [
  'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East',
  'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands',
]

export const INDICATOR_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'endterm', label: 'Endterm' },
]

export const DISAGGREGATION_OPTIONS = [
  'Age', 'Gender', 'Location', 'Disability', 'Education level', 'Income level', 'None',
]

// Results framework types
export interface OutcomeIndicator {
  id: string
  description: string
  baselineValue: string
  baselineUnit: string
  methodForMonitoring: string
  targetYear1: string
  targetYear2: string
  targetYear3: string
  targetUnit: string
  frequency: string
  dataSource: string
  disaggregation: string[]
  comments: string
}

export interface OutputIndicator {
  id: string
  description: string
  baselineValue: string
  baselineUnit: string
  methodForMonitoring: string
  targetYear1: string
  targetYear2: string
  targetYear3: string
  targetUnit: string
  frequency: string
  dataSource: string
  disaggregation: string[]
  comments: string
}

export interface Output {
  id: string
  title: string
  description: string
  indicators: OutputIndicator[]
}

export interface Outcome {
  id: string
  title: string
  description: string
  indicators: OutcomeIndicator[]
  outputs: Output[]
}

export interface Objective {
  id: string
  title: string
  description: string
  outcomes: Outcome[]
}
