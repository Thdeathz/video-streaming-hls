import mongoose, { Document, Model, Schema } from 'mongoose'

export interface VideoType extends Document {
  videoUrl: string
  thumbnailUrl: string
}

const videoSchema: Schema<VideoType> = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Video: Model<VideoType> = mongoose.model<VideoType>('Video', videoSchema)
export default Video
