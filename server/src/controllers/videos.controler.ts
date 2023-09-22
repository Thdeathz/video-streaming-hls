import { RequestHandler } from 'express'
import asyncHandler from 'express-async-handler'
import Video from '~/models/Video.model'

import { uploadVideo } from '~/utils/upload'

/**
 * @desc Create new video
 * @route POST /videos
 * @access Private
 */
export const createNewVideo: RequestHandler = asyncHandler(async (req, res) => {
  const video = req.file?.buffer

  if (!video) {
    res.status(400).json({ message: 'No video provided' })
    return
  }

  try {
    await uploadVideo(video)

    res.status(200).json({
      message: 'Video uploaded'
    })
    return
  } catch (error) {
    res.status(500).json({ message: error })
    return
  }
})
