import Hls from 'hls.js'
import { Options } from 'plyr'
import { useEffect, useRef, useState } from 'react'

const useHls = (src: string, options: Options | null) => {
  const hls = useRef<Hls>(new Hls())
  const hasQuality = useRef<boolean>(false)
  const [plyrOptions, setPlyrOptions] = useState<Options | null>(options)

  useEffect(() => {
    hasQuality.current = false
  }, [options])

  useEffect(() => {
    hls.current.loadSource(src)
    // NOTE: although it is more reactive to use the ref, but it seems that plyr wants to use the old as lazy process
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    hls.current.attachMedia(document.querySelector('.plyr-react')!)

    hls.current.on(Hls.Events.MANIFEST_PARSED, () => {
      if (hasQuality.current) return // early quit if already set

      const levels = hls.current.levels
      const quality: Options['quality'] = {
        default: levels[levels.length - 1].height,
        options: levels.map(level => level.height),
        forced: true,
        onChange: (newQuality: number) => {
          console.log('changes', newQuality)
          levels.forEach((level, levelIndex) => {
            if (level.height === newQuality) {
              hls.current.currentLevel = levelIndex
            }
          })
        }
      }
      setPlyrOptions({ ...plyrOptions, quality })
      hasQuality.current = true
    })
  })

  return { options: plyrOptions }
}

export default useHls
