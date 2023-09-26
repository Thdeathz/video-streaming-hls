import { RequestHandler } from 'express'
import asyncHandler from 'express-async-handler'
import Video from '~/models/Video.model'

import { uploadVideo } from '~/utils/upload'

/**
 * @desc Get all videos
 * @route GET /videos
 * @access Public
 */
export const getVideos: RequestHandler = asyncHandler(async (req, res) => {
  const videos = await Video.find().lean()

  res.status(200).json({
    message: 'Get all videos',
    data: videos
  })
  return
})

/**
 * @desc Create new video
 * @route POST /videos
 * @access Private
 */
export const createNewVideo: RequestHandler = asyncHandler(async (req, res) => {
  const video = req.file?.buffer
  const videoExtention = req.file?.originalname.split('.')[1]

  if (!video || !videoExtention) {
    res.status(400).json({ message: 'No video provided' })
    return
  }

  try {
    const { videoUrl, thumbnailUrl } = await uploadVideo(video, videoExtention)

    const newVideo = await Video.create({
      videoUrl,
      thumbnailUrl
    })

    res.status(200).json({
      message: 'Video uploaded',
      data: newVideo
    })
    return
  } catch (error) {
    res.status(500).json({ message: error })
    return
  }
})
