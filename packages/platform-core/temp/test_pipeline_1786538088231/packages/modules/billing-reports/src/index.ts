import type { CAPModule } from '@cap/shared-types'

export const billing_reportsModule: CAPModule = {
  id: 'billing-reports',
  version: '1.0.0',
  name: 'billing-reports',
  description: 'Auto-registered dynamic module',
  routes: [
    {
      path: '/billing-reports',
      element: null,
      layout: 'vertical'
    }
  ],
  navItems: [
    {
      id: 'billing-reports-nav',
      label: 'billing-reports',
      path: '/billing-reports',
      icon: 'tabler-box'
    }
  ]
}

export default billing_reportsModule
