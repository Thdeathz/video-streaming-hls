import { v1 } from 'uuid'
import fs from 'fs'

import { variantPlaylist } from '~/@types'
import { convertToHLS } from './ffmpeg'
import { options } from '~/config/videoResolutionOptions'
import { storeFile } from './storage'

export const uploadVideo = async (video: Buffer) => {
  console.log('Start store file')
  console.time('req_time')
  const id = v1()
  const videoStream = './local.mov'
  fs.writeFileSync('local.mov', video)

  let variantPlaylists: variantPlaylist[] = []

  // Convert video to HLS with multiple resolutions
  for (const option of options) {
    const { resolution, videoBitrate, audioBitrate } = option
    // const videoStream = intoStream(video)
    const fileNamePrefix = id + '_' + resolution

    try {
      const manifestBuffer = await convertToHLS(
        videoStream,
        id,
        videoBitrate,
        audioBitrate,
        resolution
      )

      const manifestFile = manifestBuffer
        .toString()
        .split('\n')
        .map(line => {
          if (line.includes('.ts')) {
            return `hls%2F${line}?alt=media`
          }

          return line
        })
        .join('\n')

      console.log('==> manifest', manifestFile)

      // Save current resolution manifest
      await storeFile(manifestFile, 'hls/' + fileNamePrefix + '.m3u8', 'audio/x-mpegurl')

      // Save video chunks
      const chunkFiles = fs.readdirSync('.').filter(fileName => fileName.startsWith(fileNamePrefix))

      chunkFiles.forEach(async fileName => {
        const fileBuffer = fs.readFileSync(`${fileName}`)
        await storeFile(fileBuffer, 'hls/' + fileName, 'text/vnd.trolltech.linguist')

        fs.unlinkSync(fileName)
      })

      // Get video chunks URLs
      variantPlaylists.push({
        resolution,
        outPutFileName: `${fileNamePrefix}.m3u8`
      })

      console.log('==> done encode:', resolution, variantPlaylists)
    } catch (error) {
      console.log('==> error convert to hls', error)
    }
  }

  fs.unlinkSync('local.mov')

  // Generate master playlist manifest
  let masterPlaylist = variantPlaylists
    .map(({ resolution, outPutFileName }) => {
      const bandwidth =
        resolution === '320x180' ? 676800 : resolution === '640x360' ? 1353600 : 3230400

      return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\nhls%2F${outPutFileName}?alt=media`
    })
    .join('\n')

  masterPlaylist = `#EXTM3U\n ${masterPlaylist}`

  await storeFile(masterPlaylist, 'hls/' + id + '_master.m3u8', 'audio/x-mpegurl')

  console.log('HLS master manifest generated.', masterPlaylist)
  console.timeEnd('req_time')
}
