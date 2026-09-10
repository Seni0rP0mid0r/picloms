export type HeroFrameState = 'pending' | 'loaded' | 'error'

export interface HeroReadiness {
  ready: boolean
  allFailed: boolean
  activeIndex: number | null
}

export function resolveHeroReadiness(states: readonly HeroFrameState[]): HeroReadiness {
  const activeIndex = states.findIndex((state) => state === 'loaded')
  const allSettled = states.length > 0 && states.every((state) => state !== 'pending')
  return {
    ready: allSettled && activeIndex >= 0,
    allFailed: allSettled && activeIndex < 0,
    activeIndex: activeIndex >= 0 ? activeIndex : null,
  }
}
