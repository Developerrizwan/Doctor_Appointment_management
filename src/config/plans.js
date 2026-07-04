// Single source of truth for the display-only pricing tiers (PW1).
// Editing this drives both the landing pricing section and the signup plan picker.
// No billing / enforcement yet — a hospital just picks a tier and it's stored.
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    tagline: 'For small clinics getting started',
    features: [
      'Up to 5 doctors',
      'Appointment booking',
      'Patient management',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/mo',
    tagline: 'For growing hospitals',
    features: [
      'Up to 50 doctors',
      'Everything in Free',
      'Dashboards & analytics',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For large hospital networks',
    features: [
      'Unlimited doctors',
      'Everything in Pro',
      'Custom domain',
      'Dedicated support',
    ],
    highlighted: false,
  },
]

export const PLAN_IDS = PLANS.map((p) => p.id)
