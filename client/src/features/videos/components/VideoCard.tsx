import React from 'react'
import { EntityId } from '@reduxjs/toolkit'
import { useNavigate } from 'react-router-dom'

import { useGetVideosQuery } from '../store/videosApiSlice'

type VideoCardProps = {
  videoId: EntityId
}

const VideoCard = ({ videoId }: VideoCardProps) => {
  const navigate = useNavigate()
  const { video } = useGetVideosQuery('videoList', {
    selectFromResult: ({ data }) => ({
      video: data?.entities[videoId]
    })
  })

  if (!video) return <div>Video not found</div>

  return (
    <div
      className="aspect-video w-full cursor-pointer rounded-md ring-1 transition-shadow hover:shadow-lg"
      onClick={() => navigate(`/${videoId}`)}
    >
      <img src={video.thumbnailUrl} className="rounded-md" />
    </div>
  )
}

export default VideoCard
