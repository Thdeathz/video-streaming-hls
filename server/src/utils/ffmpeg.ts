import Ffmpeg from 'fluent-ffmpeg'
import internal, { Stream } from 'stream'

type convertToHLSType = (
  videoStream: string,
  id: string,
  videoBitrate: string,
  audioBitrate: string,
  resolution: string
) => Promise<Buffer>

export const convertToHLS: convertToHLSType = async (
  videoStream,
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
      .input(videoStream)
      .inputFormat('mov')
      .outputOptions([
        '-c:v h264',
        `-b:v ${videoBitrate}`,
        '-c:a aac',
        `-b:a ${audioBitrate}`,
        `-vf scale=${resolution}`,
        '-f hls',
        '-hls_time 10',
        '-hls_list_size 0',
        `-hls_segment_filename ${fileNamePrefix}_%03d.ts`,
        '-movflags',
        'frag_keyframe+empty_moov'
      ])
      .on('end', () => {
        resolve(bufferStream.read())
      })
      .on('error', (error, stdout, stderr) => {
        console.log('HLS conversion error ==>', error)
        console.log('ffmpeg output:\n' + stdout)
        console.log('ffmpeg stderr:\n' + stderr)
        reject(error)
      })
      .on('success', () => {
        console.log('HLS conversion completed ==>', resolution)
      })

    ffmpegProcess.pipe(bufferStream, { end: false })
    ffmpegProcess.run()
  })
}
