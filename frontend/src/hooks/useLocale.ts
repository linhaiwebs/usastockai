import { useState, useEffect, useCallback } from 'react'

export type Locale = 'en' | 'ja'

const locales: Record<Locale, any> = {
  en: require('../locales/en.json'),
  ja: require('../locales/ja.json')
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // 检测浏览器语言
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.toLowerCase()
      const defaultLocale = browserLang.startsWith('ja') ? 'ja' : 'en'
      
      // 检查环境变量配置
      const envLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale
      setLocale(envLocale && ['en', 'ja'].includes(envLocale) ? envLocale : defaultLocale)
    }
  }, [])

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value: any = locales[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }, [locale])

  return { locale, setLocale, t }
}
