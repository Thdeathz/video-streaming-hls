import express from 'express'
import multer from 'multer'

import { createNewVideo } from '~/controllers/videos.controler'

const router = express.Router()
const upload = multer()

router.route('/upload').post(upload.single('video'), createNewVideo)

export default router
