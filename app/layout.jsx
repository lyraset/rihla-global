import './globals.css'

export const metadata = {
  title: 'Rihla Global | Visa Consultant',
  description:
    'Rihla Global Visa Consultant — expert guidance for student, work, tourist, business and PR visas.',
  icons: { icon: '/Rihla logo.png' },
}

// Runs before hydration so the correct theme is applied on first paint (no flash).
const themeScript = `
  try {
    if (localStorage.getItem('rihla-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
