import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#4A90E2', // Bleu Adminator professionnel
          secondary: '#5B9BD5', // Bleu secondaire Adminator
          accent: '#6BA3E3', // Bleu clair pour accents
          error: '#E74C3C', // Rouge Adminator
          info: '#3498DB', // Bleu info Adminator
          success: '#27AE60', // Vert Adminator
          warning: '#F39C12', // Orange Adminator
          background: '#F5F7FA', // Fond clair Adminator
          surface: '#FFFFFF', // Surface blanche
        },
      },
    },
  },
})

