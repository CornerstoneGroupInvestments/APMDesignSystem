// APM Participant Kiosk — managed bookmark dataset.
// Sourced verbatim from "JobSeeker_Detailed Design V1.0" §3.2.2 Kiosk Bookmarks.
// Categories mirror the Edge ManagedFavorites folder structure (DR-003).

window.KIOSK_BOOKMARKS = [
  {
    id: 'jobsearch',
    label: 'Job search',
    icon: 'search',
    accent: 'orange',
    blurb: 'Find and apply for jobs',
    items: [
      { name: 'Workforce Australia — Jobs', url: 'workforceaustralia.gov.au', mark: 'WA' },
      { name: 'SEEK', url: 'seek.com.au', mark: 'S' },
      { name: 'Indeed', url: 'au.indeed.com', mark: 'In' },
      { name: 'Jora', url: 'au.jora.com', mark: 'J' },
      { name: 'Gumtree Jobs', url: 'gumtree.com.au', mark: 'G' },
      { name: 'Ethical Jobs', url: 'ethicaljobs.com.au', mark: 'EJ' },
      { name: 'APS Jobs', url: 'apsjobs.gov.au', mark: 'AP' },
      { name: 'National Police Check', url: 'cvcheck.com', mark: 'PC' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce Australia & reporting',
    icon: 'clipboard',
    accent: 'navy',
    blurb: 'Manage your account and obligations',
    items: [
      { name: 'WFA Online for Individuals', url: 'workforceaustralia.gov.au/individuals', mark: 'WA' },
      { name: 'Your Job Plan explained', url: 'youtube.com', mark: '▶' },
      { name: 'Your Points Target', url: 'youtube.com', mark: '▶' },
      { name: 'Compliance Framework', url: 'workforceaustralia.gov.au', mark: 'CF' },
      { name: 'Contact us', url: 'workforceaustralia.gov.au/contact-us', mark: 'C' },
    ],
  },
  {
    id: 'documents',
    label: 'Resume & documents',
    icon: 'file',
    accent: 'purple',
    blurb: 'Build your resume and cover letter',
    items: [
      { name: 'Resume templates', url: 'create.microsoft.com', mark: 'W' },
      { name: 'Cover letter templates', url: 'create.microsoft.com', mark: 'W' },
      { name: 'Word for the web', url: 'office.com', mark: 'W' },
      { name: 'Improve your job search', url: 'workforceaustralia.gov.au/coaching', mark: 'IJ' },
    ],
  },
  {
    id: 'government',
    label: 'Centrelink & Services Australia',
    icon: 'building',
    accent: 'indigo',
    blurb: 'Government forms and reporting',
    items: [
      { name: 'Medical Certificate (SU415)', url: 'servicesaustralia.gov.au/su415', mark: 'SU' },
      { name: 'Verification of medical conditions (SU684)', url: 'servicesaustralia.gov.au/su684', mark: 'SU' },
      { name: 'Report employment income', url: 'servicesaustralia.gov.au', mark: 'SA' },
    ],
  },
  {
    id: 'support',
    label: 'Essential support services',
    icon: 'heart',
    accent: 'magenta',
    blurb: 'Free help when you need it',
    items: [
      { name: 'Ask Izzy', url: 'askizzy.org.au', mark: 'AI' },
      { name: 'Beyond Blue', url: 'beyondblue.org.au', mark: 'BB' },
      { name: 'Headspace', url: 'headspace.org.au', mark: 'H' },
      { name: 'Drug Foundation help & support', url: 'adf.org.au', mark: 'ADF' },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    icon: 'cap',
    accent: 'navy',
    blurb: 'Courses and skills',
    items: [
      { name: 'TAFE (your state)', url: 'tafe.edu.au', mark: 'T' },
      { name: 'Duke', url: 'duke.co', mark: 'D' },
      { name: 'MCI Institute', url: 'mciinstitute.edu.au', mark: 'M' },
      { name: 'Alffie', url: 'alffie.com', mark: 'A' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'bus',
    accent: 'orange',
    blurb: 'Getting to interviews and work',
    items: [
      { name: 'Transport for NSW', url: 'transport.nsw.gov.au', mark: 'NSW' },
      { name: 'Transport VIC', url: 'vic.gov.au', mark: 'VIC' },
      { name: 'TMR Queensland', url: 'tmr.qld.gov.au', mark: 'QLD' },
      { name: 'Transport WA', url: 'transport.wa.gov.au', mark: 'WA' },
    ],
  },
  {
    id: 'other',
    label: 'Other services',
    icon: 'compass',
    accent: 'purple',
    blurb: 'Work rights and volunteering',
    items: [
      { name: 'Fair Work', url: 'fairwork.gov.au', mark: 'FW' },
      { name: 'Pay & Conditions Tool', url: 'calculate.fairwork.gov.au', mark: 'PC' },
      { name: 'Volunteering Australia', url: 'govolunteer.com.au', mark: 'V' },
    ],
  },
];
