// Laboro Design Tokens — worker-app
// Mirrors the design system from /design/theme.js

export const C = {
  // navy family
  navy:       '#0E2A78',
  navyDeep:   '#081C57',
  navyLight:  '#1B3FA0',
  navySoft:   '#2A4FBF',
  // jade family (money / success)
  jade:       '#00C48C',
  jadeDeep:   '#00A372',
  jadeSoft:   '#E6FAF3',
  jadeInk:    '#0A2A1E',
  // urgent / alert
  orange:     '#FF6B35',
  orangeSoft: '#FFEEE6',
  // neutrals
  ink:        '#0A0F1F',
  ink2:       '#1A1A2E',
  text:       '#1A1A2E',
  textMute:   '#5C6079',
  textSoft:   '#8A8FA6',
  line:       '#E6E8F0',
  lineSoft:   '#EFF1F7',
  surface:    '#FFFFFF',
  surface2:   '#F8F9FC',
  surface3:   '#F1F3F9',
} as const

// Icon paths from design — for use with react-native-svg Path or custom Icon component
export const ICON_PATHS = {
  bell:      'M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0',
  star:      'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  pin:       'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:     'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  bolt:      'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  lock:      'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  check:     'M5 12l4 4L19 7',
  chevR:     'M9 6l6 6-6 6',
  chevL:     'M15 6l-6 6 6 6',
  chevD:     'M6 9l6 6 6-6',
  filter:    'M4 5h16M7 12h10M10 19h4',
  search:    'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-3-3',
  home:      'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  calendar:  'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  wallet:    'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4Z',
  user:      'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  edit:      'M4 20h4l10-10-4-4L4 16v4Zm10-12l4 4',
  x:         'M6 6l12 12M6 18L18 6',
  plus:      'M12 5v14M5 12h14',
  briefcase: 'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
  users:     'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
  eye:       'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  camera:    'M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  shield:    'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z',
  phone:     'M5 4h3l2 5-2 1c.7 2 2.3 3.7 4.5 4.5l1-2 5 2v3a2 2 0 0 1-2 2C9.4 19 5 14.6 5 6a2 2 0 0 1 0-2Z',
  msg:       'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z',
  trophy:    'M8 4h8v3a4 4 0 0 1-8 0V4Zm-3 1h3v4a3 3 0 0 1-3-3V5Zm14 0h-3v4a3 3 0 0 0 3-3V5ZM10 14h4l-1 4h-2l-1-4Zm-2 5h8',
  flame:     'M12 3s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-1-1.5 0-4c0 0 1 2 3-2Z',
  doc:       'M6 3h9l4 4v14H6V3Zm9 0v4h4',
  arrowR:    'M5 12h14m-4-4l4 4-4 4',
  arrowDown: 'M12 5v14m4-4l-4 4-4-4',
  arrowUp:   'M12 19V5m4 4l-4-4-4 4',
  warn:      'M12 3l10 18H2L12 3Zm0 6v6m0 3v.5',
  info:      'M12 8h.01M11 12h1v5h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  route:     'M5 5a3 3 0 1 0 0 6h10a3 3 0 1 1 0 6H5',
  qr:        'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14v2m4-2v6m-4-2h4m0-4h2',
  settings:  'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  money:     'M12 6v12M9 9h4a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h4',
  pix:       'M5 12l7-7 7 7-7 7-7-7Zm5 0l2-2 2 2-2 2-2-2Z',
} as const

export type IconName = keyof typeof ICON_PATHS
