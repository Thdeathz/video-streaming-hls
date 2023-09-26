import React, { useRef } from 'react'
import Plyr from 'plyr'
import Hls from 'hls.js'
import { useEffectOnce } from 'usehooks-ts'

type PropsType = {
  videoSource: string
  className?: string
}

const VideoPlayer = ({ videoSource, className }: PropsType) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoHls = new Hls({
    maxBufferLength: 15,
    maxMaxBufferLength: 30
  })

  useEffectOnce(() => {
    const loadVideo = async () => {
      if (Hls.isSupported() && videoRef.current) {
        const video = videoRef.current

        videoHls.on(Hls.Events.MANIFEST_PARSED, () => {
          const resolutions = videoHls.levels.map(level => level.height)
          resolutions.unshift(0)

          new Plyr(video, {
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'mute',
              'volume',
              'settings',
              'pip',
              'airplay',
              'fullscreen'
            ],
            quality: {
              default: 0,
              options: resolutions,
              forced: true,
              onChange: (quality: number) => {
                // Manually set the quality
                videoHls.levels.forEach((level, levelIndex) => {
                  if (level.height === quality) {
                    videoHls.currentLevel = levelIndex
                    videoHls.nextLevel = levelIndex
                    videoHls.nextLoadLevel = levelIndex
                  }
                })
              }
            }
          })
        })

        videoHls.loadSource(videoSource)
        videoHls.attachMedia(video)
      }
    }

    if (videoRef.current) loadVideo()
  })

  return <video id="video" ref={videoRef} controls className={className} />
}

export default VideoPlayer
