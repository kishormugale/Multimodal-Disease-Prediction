// ─── Mock Patients ───
export const initialPatients = [
  { id: 'PT-82741', name: 'Eleanor Shellstrop', age: 36, gender: 'Female', status: 'Stable', lastVisit: '2 hours ago' },
  { id: 'PT-99321', name: 'Chidi Anagonye', age: 32, gender: 'Male', status: 'Critical', lastVisit: 'Critical Monitoring' },
  { id: 'PT-01293', name: 'Tahani Al-Jamil', age: 34, gender: 'Female', status: 'Stable', lastVisit: 'Post-operative Observation' },
  { id: 'PT-44210', name: 'Jason Mendoza', age: 28, gender: 'Male', status: 'Admitted', lastVisit: 'Triage Assessment' },
  { id: 'PT-55820', name: 'Janet Della-Denunzio', age: 45, gender: 'Female', status: 'Stable', lastVisit: 'Regular Checkup' },
  { id: 'PT-67312', name: 'Michael Realman', age: 51, gender: 'Male', status: 'Admitted', lastVisit: 'Neurological Assessment' },
  { id: 'PT-78410', name: 'Simone Garnett', age: 29, gender: 'Female', status: 'Stable', lastVisit: 'Follow-up Visit' },
  { id: 'PT-89501', name: 'Doug Forcett', age: 68, gender: 'Male', status: 'Critical', lastVisit: 'Emergency Admission' },
]

// ─── Disease Types ───
export const diseases = [
  {
    id: 'brain-tumor',
    name: 'Brain Tumor Detection',
    type: 'image',
    icon: 'neurology',
    description: 'Neural segmentation of MRI scans to identify gliomas, meningiomas, and pituitary tumors with 99.2% accuracy.',
    tags: ['Imaging Analysis', 'High Precision'],
    uploadLabel: 'MRI Scan Upload',
    hero: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD7Y7Et04qGDx3jBsRLz1HUsEr1s_RTZF9yyXZKP0luTZWzsRFsbU0iVBZhO7o_jre1vlSHbyClGbWA_SG1DZsjpbWu4K4GA0bXV6BxruH8Nw9ZTe-pSQROW7DPGj9zC-NUnEYZYNWsVRUJ2UFYp4jApOwewnOI660123uUN8k7DDXFk_CLPyOi5ilq1EhRK2wuERtP79bzY6SYVmlKzCUJkSFxKFkH2QWah_ekcrDnpNrL0g0SvtvnudiuoE6FH4LMGk1YS2xyg9g',
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    type: 'image',
    icon: 'pulmonology',
    description: 'Chest X-Ray analysis for bacterial and viral infection markers.',
    tags: ['X-Ray Analysis'],
    uploadLabel: 'X-Ray Upload',
  },
  {
    id: 'skin-cancer',
    name: 'Skin Cancer',
    type: 'image',
    icon: 'dermatology',
    description: 'Dermatoscopic image evaluation for malignant melanoma and lesions.',
    tags: ['Visual Scan'],
    uploadLabel: 'Dermoscopy Image',
  },
  {
    id: 'eye-disease',
    name: 'Eye Disease',
    type: 'image',
    icon: 'visibility',
    description: 'Retinal fundus image analysis for diabetic retinopathy, glaucoma, and cataracts.',
    tags: ['Retinal Analysis'],
    uploadLabel: 'Fundus Image',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADDAuBbzusb5pW19w2adJ5hSGygdSKEnCimyb3TaLPeijtTQhdb9FBOVfzgxl6GY968GJCGGhXcnwOmq94ku3z8z-AZQV5oYKxicxsu13sxRemfM1lTY0UiJR8UWEg2_yO9lAf2J0rMOMT2FAOGFCYOWg5OV--LJV0dgeM1duRUXsEAdKWhR1WYrNoq0SnlSUQCGHWb7UW92UIqTNY_X-bW5l5vjVeYJrznaA4YEB32ifxfugm9x1-T7pJzxInwJj_UYqWxMSL7-wZ',
  },
  {
    id: 'heart-disease',
    name: 'Heart Disease',
    type: 'tabular',
    icon: 'favorite',
    description: 'Predict likelihood of cardiovascular events using patient vitals, lipid profiles, and EKG metrics.',
    tags: ['Tabular Model'],
    fields: [
      { key: 'age', label: 'Patient Age', type: 'number', placeholder: 'e.g. 54' },
      { key: 'bp', label: 'Resting BP (mm Hg)', type: 'number', placeholder: 'e.g. 130' },
      { key: 'cholesterol', label: 'Serum Cholesterol', type: 'number', placeholder: 'e.g. 240' },
      { key: 'blood_sugar', label: 'Fasting Blood Sugar', type: 'select', options: ['< 120 mg/dl', '> 120 mg/dl'] },
      { key: 'heart_rate', label: 'Max Heart Rate Achieved', type: 'number', placeholder: 'e.g. 150' },
      { key: 'chest_pain', label: 'Chest Pain Type', type: 'select', options: ['Typical Angina', 'Atypical Angina', 'Non-Anginal Pain', 'Asymptomatic'] },
    ],
  },
  {
    id: 'diabetes',
    name: 'Diabetes Risk',
    type: 'tabular',
    icon: 'medical_services',
    description: 'Multi-factor analysis including glucose levels, BMI, and genetic predisposition markers.',
    tags: ['Tabular Model'],
    fields: [
      { key: 'age', label: 'Patient Age', type: 'number', placeholder: 'e.g. 45' },
      { key: 'glucose', label: 'Glucose Level (mg/dL)', type: 'number', placeholder: 'e.g. 120' },
      { key: 'bmi', label: 'BMI', type: 'number', placeholder: 'e.g. 28.5' },
      { key: 'bp', label: 'Blood Pressure (mm Hg)', type: 'number', placeholder: 'e.g. 80' },
      { key: 'insulin', label: 'Insulin (mu U/ml)', type: 'number', placeholder: 'e.g. 85' },
      { key: 'skin_thickness', label: 'Skin Thickness (mm)', type: 'number', placeholder: 'e.g. 29' },
    ],
  },
]

// ─── Mock Predictions / Reports ───
export const initialReports = [
  { id: 1, patientName: 'Elena Jameson', patientId: 'PT-82741', disease: 'Cardiovascular Risk', result: 'Positive', risk: 'High', confidence: 98.2, date: '2024-10-24', time: '14:22', suggestion: 'Immediate ECG and cardiology referral recommended.' },
  { id: 2, patientName: 'Marcus Thorne', patientId: 'PT-99321', disease: 'Pneumonia', result: 'Negative', risk: 'Low', confidence: 85.4, date: '2024-10-22', time: '09:15', suggestion: 'Continue monitoring. No immediate intervention required.' },
  { id: 3, patientName: 'Sarah Chen', patientId: 'PT-01293', disease: 'Skin Cancer', result: 'Negative', risk: 'Low', confidence: 91.7, date: '2024-10-21', time: '16:45', suggestion: 'Benign lesion detected. Annual follow-up recommended.' },
  { id: 4, patientName: 'Robert Lewis', patientId: 'PT-44210', disease: 'Eye Disease', result: 'Positive', risk: 'High', confidence: 96.0, date: '2024-10-19', time: '11:02', suggestion: 'Urgent ophthalmology referral for retinal assessment.' },
  { id: 5, patientName: 'Isabella Garcia', patientId: 'PT-55820', disease: 'Diabetes Risk', result: 'Positive', risk: 'Medium', confidence: 74.2, date: '2024-10-18', time: '08:50', suggestion: 'Lifestyle modifications and 3-month glucose monitoring.' },
  { id: 6, patientName: 'David Kim', patientId: 'PT-67312', disease: 'Brain Tumor', result: 'Negative', risk: 'Low', confidence: 88.9, date: '2024-10-15', time: '10:30', suggestion: 'No anomalies detected in MRI scan. Routine follow-up in 6 months.' },
  { id: 7, patientName: 'Maria Santos', patientId: 'PT-78410', disease: 'Heart Disease', result: 'Positive', risk: 'Medium', confidence: 79.5, date: '2024-10-12', time: '13:18', suggestion: 'Moderate cardiovascular risk. Recommend stress test and lipid panel.' },
]

// ─── Dashboard Chart Data ───
export const weeklyChartData = [
  { day: 'Mon', patients: 42, predictions: 8 },
  { day: 'Tue', patients: 68, predictions: 12 },
  { day: 'Wed', patients: 55, predictions: 10 },
  { day: 'Thu', patients: 89, predictions: 18 },
  { day: 'Fri', patients: 47, predictions: 9 },
  { day: 'Sat', patients: 78, predictions: 15 },
  { day: 'Sun', patients: 62, predictions: 11 },
]

// ─── Dashboard Activity ───
export const recentActivity = [
  { id: 1, icon: 'psychology', color: 'text-primary', title: 'AI Prediction Generated', desc: 'Patient #4928 - High mobility recovery chance.', time: '14 Minutes ago' },
  { id: 2, icon: 'lab_profile', color: 'text-tertiary', title: 'New Lab Results', desc: 'MRI Scans uploaded for Sarah J. (Ward 2)', time: '1 Hour ago' },
  { id: 3, icon: 'person_add', color: 'text-secondary', title: 'Patient Admitted', desc: 'Robert Miller transferred to Neurological Unit.', time: '3 Hours ago' },
  { id: 4, icon: 'note_alt', color: 'text-primary', title: 'Staff Update', desc: 'Dr. Chen finished rounds in Section C.', time: 'Yesterday' },
]

// ─── Mock Prediction Generator ───
export function generateMockPrediction(diseaseId) {
  const isPositive = Math.random() > 0.4
  const confidence = isPositive
    ? (75 + Math.random() * 24).toFixed(1)
    : (60 + Math.random() * 30).toFixed(1)

  const riskLevels = isPositive
    ? (parseFloat(confidence) > 90 ? 'High' : 'Medium')
    : 'Low'

  const suggestions = {
    'brain-tumor': isPositive
      ? 'Anomaly detected in MRI scan. Immediate neurosurgical consultation recommended. Schedule contrast-enhanced MRI within 48 hours.'
      : 'No significant anomalies detected. Recommend routine follow-up MRI in 6 months.',
    'pneumonia': isPositive
      ? 'Infiltrates consistent with pneumonia detected. Initiate empiric antibiotic therapy and obtain sputum culture.'
      : 'Lungs appear clear. No signs of active infection. Continue routine monitoring.',
    'skin-cancer': isPositive
      ? 'Suspicious lesion identified. Recommend excisional biopsy and dermatopathology referral within 2 weeks.'
      : 'Benign appearing lesion. Annual dermoscopic surveillance recommended.',
    'eye-disease': isPositive
      ? 'Signs of glaucomatous optic neuropathy detected. Urgent ophthalmology referral for IOP measurement and visual field testing.'
      : 'Retinal fundus appears normal. Continue annual eye examinations.',
    'heart-disease': isPositive
      ? 'Clinical parameters indicate high probability of coronary artery disease. Immediate ECG and cardiology referral recommended. Monitor BP closely over next 48 hours.'
      : 'Cardiovascular risk parameters within normal range. Maintain healthy lifestyle and annual screening.',
    'diabetes': isPositive
      ? 'Elevated glucose and metabolic markers suggest pre-diabetic or diabetic state. Recommend HbA1c test, dietary counseling, and 3-month follow-up.'
      : 'Metabolic parameters within acceptable range. Continue balanced diet and regular exercise.',
  }

  return {
    result: isPositive ? 'Positive' : 'Negative',
    confidence: parseFloat(confidence),
    risk: riskLevels,
    suggestion: suggestions[diseaseId] || 'Please consult with a specialist for further evaluation.',
  }
}
