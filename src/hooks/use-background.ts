import { useEffect, useState } from "react"

declare global {
  interface Window {
    CustomBackgroundImage: string
    CustomMobileBackgroundImage: string
    ForceShowServices: boolean
    ForceCardInline: boolean
    ForceShowMap: boolean
    ForcePeakCutEnabled: boolean
  }
}

const BACKGROUND_CHANGE_EVENT = "backgroundChange"
const THEME_SETTINGS_LOADED_EVENT = "themeSettingsLoaded"

export function useBackground() {
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined)

  useEffect(() => {
    // 监听背景变化
    const handleBackgroundChange = () => {
      setBackgroundImage(window.CustomBackgroundImage || undefined)
    }

    // 初始化检查
    const checkInitialBackground = () => {
      if (window.CustomBackgroundImage) {
        setBackgroundImage(window.CustomBackgroundImage)
      } else {
        const savedImage = sessionStorage.getItem("savedBackgroundImage")
        if (savedImage) {
          window.CustomBackgroundImage = savedImage
          setBackgroundImage(savedImage)
        }
      }
    }

    checkInitialBackground()
    window.addEventListener(BACKGROUND_CHANGE_EVENT, handleBackgroundChange)
    window.addEventListener(THEME_SETTINGS_LOADED_EVENT, checkInitialBackground)

    return () => {
      window.removeEventListener(BACKGROUND_CHANGE_EVENT, handleBackgroundChange)
      window.removeEventListener(THEME_SETTINGS_LOADED_EVENT, checkInitialBackground)
    }
  }, [])

  const updateBackground = (newBackground: string | undefined) => {
    window.CustomBackgroundImage = newBackground || ""
    window.dispatchEvent(new Event(BACKGROUND_CHANGE_EVENT))
  }

  return { backgroundImage, updateBackground }
}
