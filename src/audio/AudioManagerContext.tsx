import { createContext, useContext, type ReactNode } from "react"

export type VoicePlaybackOptions = {
  src: string
  onStart?: () => void
  onEnded?: () => void
}

export type AudioManagerValue = {
  playVoice: (options: VoicePlaybackOptions) => Promise<boolean>
  stopVoice: () => void
  isVoicePlaying: () => boolean
  duckMusic: (durationMs?: number, targetVolume?: number) => void
  restoreMusic: (durationMs?: number) => void
}

const AudioManagerContext = createContext<AudioManagerValue | null>(null)

export function AudioManagerProvider({
  value,
  children,
}: {
  value: AudioManagerValue
  children: ReactNode
}) {
  return <AudioManagerContext.Provider value={value}>{children}</AudioManagerContext.Provider>
}

export function useAudioManager() {
  const context = useContext(AudioManagerContext)
  if (!context) {
    throw new Error("useAudioManager must be used inside AudioManagerProvider")
  }
  return context
}
