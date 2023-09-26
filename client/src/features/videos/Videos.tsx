import React from 'react'

import { useGetVideosQuery } from './store/videosApiSlice'
import VideoCard from './components/VideoCard'
import { DefaultLayout } from '~/components'
import Loading from '~/components/Loading'
import { CloudUploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const Videos = () => {
  const navigate = useNavigate()

  const { data: videos, isLoading } = useGetVideosQuery('videosList')

  if (isLoading) return <Loading />

  if (!videos) return <div>No videos</div>

  return (
    <DefaultLayout>
      <div className="grid max-h-[80vh] min-h-[80vh] min-w-[75vw] max-w-[75vw] auto-rows-min grid-cols-4 gap-4">
        {videos.ids.map(videoId => (
          <VideoCard key={`video-list-${videoId}`} videoId={videoId} />
        ))}

        <button
          className="flex-center aspect-video w-full cursor-pointer flex-col rounded-md border border-dashed border-disable text-disable transition-colors hover:border-primary-5 hover:text-primary-5"
          onClick={() => navigate('/upload')}
        >
          <CloudUploadOutlined className="text-3xl" />
          <span>Click or drop your file here</span>
        </button>
      </div>
    </DefaultLayout>
  )
}

export default Videos
