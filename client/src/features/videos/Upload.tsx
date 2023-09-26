import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { Button } from 'antd'
import { CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { DefaultLayout } from '~/components'
import ButtonBack from '~/components/ButtonBack'
import { useUploadVideoMutation } from './store/videosApiSlice'

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, y: -10 }
}

const Upload = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<FileFreview | null>(null)
  const [uploadVideo, { isLoading }] = useUploadVideoMutation()

  const handleChangeInputFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const previewUrl = URL.createObjectURL(file)
    const preview = Object.assign(file, { preview: previewUrl })

    setFile(preview)
  }

  const onFinish = async () => {
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('video', file)

      await uploadVideo(formData)

      setFile(null)
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <DefaultLayout>
      <div className="flex w-[75vw] flex-col items-start justify-start">
        <div className="flex w-full items-center justify-between">
          <ButtonBack />

          <span className="text-xl font-medium">Upload video</span>
        </div>

        <div className="group relative mt-2 w-full grow cursor-pointer rounded-md border border-dashed border-disable transition-colors hover:border-primary-4">
          <input
            className="h-upload-video w-full cursor-pointer opacity-0"
            type="file"
            accept=".mov,.mp4,.webm"
            onChange={handleChangeInputFile}
          />

          <div className="absolute left-0 top-0 -z-10 flex h-full w-full flex-col items-center justify-center text-neutral-5 transition-colors group-hover:text-primary-4 ">
            <CloudUploadOutlined className="text-5xl " />
            <span>Click or drop your file here</span>
          </div>

          {file && (
            <ReactPlayer
              className="absolute left-0 top-0 -z-10 h-upload-video max-h-upload-video w-full rounded-md"
              playing
              muted
              url={file.preview}
            />
          )}
        </div>

        {file && (
          <motion.div variants={variants} initial="hidden" animate="enter" exit="exit">
            <Button className="mt-2" type="primary" ghost onClick={onFinish}>
              {isLoading ? <LoadingOutlined /> : 'Upload'}
            </Button>
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  )
}

export default Upload
