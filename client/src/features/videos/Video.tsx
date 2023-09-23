import React from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'

import { DefaultLayout } from '~/components'
import { useGetVideosQuery } from './store/videosApiSlice'
import ReactPlayer from 'react-player'
import ButtonBack from '~/components/ButtonBack'

const Video = () => {
  const location = useLocation()
  const { videoId } = useParams()
  const { video } = useGetVideosQuery('videosList', {
    selectFromResult: ({ data }) => ({
      video: data?.entities[videoId as string]
    })
  })

  if (!video) return <Navigate to="/" state={{ from: location }} replace />

  return (
    <DefaultLayout>
      <div className="relative h-[80vh] max-h-[80vh] w-[75vw] max-w-[75vw] rounded-md shadow-md">
        <ReactPlayer className="h-full w-full rounded-md" controls url={video.videoUrl} />

        <ButtonBack className="absolute left-4 top-4 rounded p-1 hover:bg-neutral-3" />
      </div>
    </DefaultLayout>
  )
}

export default Video
