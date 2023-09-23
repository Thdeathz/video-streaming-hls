import Ffmpeg from 'fluent-ffmpeg'
import internal, { Stream } from 'stream'

type convertToHLSType = (
  videoPath: string,
  id: string,
  videoBitrate: string,
  audioBitrate: string,
  resolution: string
) => Promise<Buffer>

export const convertToHLS: convertToHLSType = (
  videoPath,
  id,
  videoBitrate,
  audioBitrate,
  resolution
) => {
  return new Promise((resolve, reject) => {
    console.log('<---------------------------------------->')
    console.log('HLS conversion started ==>', resolution)
    const fileNamePrefix = id + '_' + resolution

    let bufferStream = new Stream.PassThrough()

    const ffmpegProcess = Ffmpeg()
      .input(videoPath)
      .inputFormat('mov')
      .outputOptions([
        '-c:v h264',
        `-b:v ${videoBitrate}`,
        '-c:a aac',
        `-b:a ${audioBitrate}`,
        `-vf scale=${resolution}`,
        '-f hls',
        '-hls_time 15',
        '-hls_playlist_type vod',
        `-hls_segment_filename ${fileNamePrefix}_%03d.ts`,
        '-segment_list_entry_prefix hls%2F',
        '-movflags',
        'frag_keyframe+empty_moov',
        '-force_key_frames expr:gte(t,n_forced*10)'
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

export const generateThumbnail = (videoPath: string) => {
  return new Promise((resolve, reject) => {
    Ffmpeg()
      .input(videoPath)
      .inputFormat('mov')
      .takeFrames(1)
      .output('local.png')
      .on('end', () => resolve(null))
      .on('error', (error, stdout, stderr) => reject(stderr))
      .run()
  })
}
