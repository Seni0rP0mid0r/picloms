export type MediaRole = 'hero' | 'campaign' | 'object' | 'lineup' | 'thumbnail'

export interface ArchiveMedia {
  id: string
  src: string
  source: string
  role: MediaRole
  alt: ''
  position?: string
  srcSet?: string
  sizes?: string
}

export const brandMedia = {
  mark: '/media/brand-mark-transparent.png',
  source: '5265091080233884798.jpg',
} as const

export const heroFrames: readonly ArchiveMedia[] = [
  { id: 'campaign-wide', src: '/media/hero-wide-1920.jpg', srcSet: '/media/hero-wide-960.jpg 960w, /media/hero-wide-1920.jpg 1920w', sizes: '100vw', source: 'IMG_2776.PNG', role: 'hero', alt: '', position: '50% 48%' },
  { id: 'campaign-portrait', src: '/media/hero-portrait-1280.jpg', srcSet: '/media/hero-portrait-720.jpg 720w, /media/hero-portrait-1280.jpg 1280w', sizes: '100vw', source: 'IMG_2778 (2).PNG', role: 'campaign', alt: '', position: '50% 38%' },
]

export const archiveMedia: readonly ArchiveMedia[] = [
  { id: 'campaign-portrait', src: '/media/archive-campaign-portrait-960.jpg', srcSet: '/media/archive-campaign-portrait-480.jpg 480w, /media/archive-campaign-portrait-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: 'IMG_2778 (2).PNG', role: 'hero', alt: '' },
  { id: 'silver-collage', src: '/media/archive-silver-collage-960.jpg', srcSet: '/media/archive-silver-collage-480.jpg 480w, /media/archive-silver-collage-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: '5265091080233884834.jpg', role: 'campaign', alt: '' },
  { id: 'object-01', src: '/media/archive-object-01-960.jpg', srcSet: '/media/archive-object-01-480.jpg 480w, /media/archive-object-01-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: '5265091080233884835.jpg', role: 'object', alt: '' },
  { id: 'object-02', src: '/media/archive-object-02-960.jpg', srcSet: '/media/archive-object-02-480.jpg 480w, /media/archive-object-02-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: '5265091080233884837.jpg', role: 'object', alt: '' },
  { id: 'object-03', src: '/media/archive-object-03-960.jpg', srcSet: '/media/archive-object-03-480.jpg 480w, /media/archive-object-03-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: '5265091080233884839.jpg', role: 'object', alt: '' },
  { id: 'object-04', src: '/media/archive-object-04-960.jpg', srcSet: '/media/archive-object-04-480.jpg 480w, /media/archive-object-04-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: '5265091080233884840.jpg', role: 'object', alt: '' },
  { id: 'silver-cutout', src: '/media/archive-silver-cutout-960.jpg', srcSet: '/media/archive-silver-cutout-480.jpg 480w, /media/archive-silver-cutout-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: 'IMG_2775.PNG', role: 'campaign', alt: '' },
  { id: 'campaign-wide', src: '/media/archive-campaign-wide-960.jpg', srcSet: '/media/archive-campaign-wide-480.jpg 480w, /media/archive-campaign-wide-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: 'IMG_2776.PNG', role: 'campaign', alt: '' },
  { id: 'campaign-lineup', src: '/media/archive-campaign-lineup-960.jpg', srcSet: '/media/archive-campaign-lineup-480.jpg 480w, /media/archive-campaign-lineup-960.jpg 960w', sizes: '(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw', source: 'IMG_2777.PNG', role: 'lineup', alt: '' },
  { id: 'campaign-thumbnail', src: '/media/archive-campaign-thumbnail-226.jpg', srcSet: '/media/archive-campaign-thumbnail-226.jpg 226w', sizes: '226px', source: 'IMG_2778.PNG', role: 'thumbnail', alt: '' },
]
