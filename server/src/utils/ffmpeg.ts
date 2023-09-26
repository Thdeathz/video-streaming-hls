import Ffmpeg from 'fluent-ffmpeg'
import { Stream } from 'stream'

type convertToHLSType = (
  videoPath: string,
  videoExtention: string,
  fileNamePrefix: string,
  videoBitrate: string,
  audioBitrate: string,
  resolution: string
) => Promise<Buffer>

export const convertToHLS: convertToHLSType = (
  videoPath,
  videoExtention,
  fileNamePrefix,
  videoBitrate,
  audioBitrate,
  resolution
) => {
  return new Promise((resolve, reject) => {
    console.log('<---------------------------------------->')
    console.log('HLS conversion started ==>', resolution)

    let bufferStream = new Stream.PassThrough()

    const ffmpegProcess = Ffmpeg()
      .input(videoPath)
      .inputFormat(videoExtention)
      .outputOptions([
        '-c:v h264',
        `-b:v ${videoBitrate}`,
        '-c:a aac',
        `-b:a ${audioBitrate}`,
        `-vf scale=${resolution}`,
        '-f hls',
        '-hls_time 8',
        '-hls_playlist_type vod',
        `-hls_segment_filename ${fileNamePrefix}_%03d.ts`,
        '-movflags',
        'frag_keyframe+empty_moov',
        '-force_key_frames expr:gte(t,n_forced*8)'
      ])
      .on('end', () => {
        resolve(bufferStream.read())
      })
      .on('error', (error, stdout, stderr) => {
        reject(stderr)
      })
      .on('success', () => {
        console.log('HLS conversion completed ==>', resolution)
      })

    ffmpegProcess.pipe(bufferStream, { end: false })
    ffmpegProcess.run()
  })
}

export const generateThumbnail = (videoPath: string, outputPath: string) => {
  return new Promise((resolve, reject) => {
    Ffmpeg()
      .input(videoPath)
      .inputFormat('mov')
      .seekInput('00:00:10')
      .takeFrames(1)
      .output(outputPath)
      .on('end', () => resolve(null))
      .on('error', (error, stdout, stderr) => reject(stderr))
      .run()
  })
}
