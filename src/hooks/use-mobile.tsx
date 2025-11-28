
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const SMALL_SCREEN_BREAKPOINT = 640

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const checkMobile = () => {
      // Check both viewport size and user agent
      const isMobileViewport = window.innerWidth < MOBILE_BREAKPOINT
      
      // Some devices report as mobile even with larger viewports
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      
      const result = isMobileViewport || isMobileDevice
      console.log(`[useIsMobile] Detected: ${result ? 'Mobile' : 'Desktop'} (viewport: ${window.innerWidth}px, userAgent mobile: ${isMobileDevice})`)
      
      setIsMobile(result)
    }
    
    mql.addEventListener("change", checkMobile)
    checkMobile()
    
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  return !!isMobile
}

export function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SMALL_SCREEN_BREAKPOINT - 1}px)`)
    
    const checkScreenSize = () => {
      const result = window.innerWidth < SMALL_SCREEN_BREAKPOINT
      console.log(`[useIsSmallScreen] Detected: ${result ? 'Small Screen' : 'Normal Screen'} (viewport: ${window.innerWidth}px)`)
      setIsSmallScreen(result)
    }
    
    mql.addEventListener("change", checkScreenSize)
    checkScreenSize()
    
    return () => mql.removeEventListener("change", checkScreenSize)
  }, [])

  return !!isSmallScreen
}

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = React.useState({
    hasCamera: false,
    hasTouch: false,
    hasBattery: 'battery' in navigator
  })

  React.useEffect(() => {
    // Check if device has camera
    const checkCamera = async () => {
      try {
        // Try to enumerate devices to check for camera
        const devices = await navigator.mediaDevices?.enumerateDevices?.() || []
        const hasCamera = devices.some(device => device.kind === 'videoinput')
        console.log(`[useDeviceCapabilities] Camera detected: ${hasCamera ? 'Yes' : 'No'}`)
        setCapabilities(prev => ({ ...prev, hasCamera }))
      } catch (error) {
        // If there's an error or permissions issue, we can't determine for sure
        console.log('Could not check camera availability:', error)
      }
    }
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0
    
    console.log(`[useDeviceCapabilities] Touch capability: ${hasTouch ? 'Yes' : 'No'}, MaxTouchPoints: ${navigator.maxTouchPoints}`)
    
    setCapabilities(prev => ({ ...prev, hasTouch }))
    
    // Only check camera if we likely have one (mobile or touch device)
    if (hasTouch) {
      checkCamera()
    }
  }, [])
  
  return capabilities
}
