import React from 'react'
import { useParams } from 'react-router-dom'

import { DefaultLayout } from '~/components'
import { useGetVideosQuery } from './store/videosApiSlice'
import ButtonBack from '~/components/ButtonBack'
import Loading from '~/components/Loading'
import VideoPlayer from './components/VideoPlayer'

const Video = () => {
  const { videoId } = useParams()

  const { video } = useGetVideosQuery('videosList', {
    selectFromResult: ({ data }) => ({
      video: data?.entities[videoId as string]
    })
  })

  if (!video) return <Loading />

  return (
    <DefaultLayout>
      <div className="relative h-[80vh] max-h-[80vh] w-[75vw] max-w-[75vw] rounded-md shadow-md">
        <VideoPlayer videoSource={video.videoUrl} className="aspect-video h-[80vh] rounded-md" />

        <ButtonBack className="absolute left-4 top-4 rounded p-1 hover:bg-neutral-3" />
      </div>
    </DefaultLayout>
  )
}

export default Video
