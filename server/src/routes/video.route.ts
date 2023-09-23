import express from 'express'
import multer from 'multer'

import { createNewVideo, getVideos } from '~/controllers/videos.controler'

const router = express.Router()
const upload = multer()

router.route('/').get(getVideos)

router.route('/upload').post(upload.single('video'), createNewVideo)

export default router
