// log the pageview with their URL
export const pageview = (url: string) => {
  const ga: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS
  if (ga) {
    window.gtag('config', ga, {
      page_path: url,
    })
  }
}

// log specific events happening.
export const event = ({ action, params }: {action: string, params: any}) => {
  window.gtag('event', action, params)
}

declare global {
  interface Window {
    gtag: any;
    AliPlayerComponent: any;
  }
}