import { v1 } from 'uuid'
import fs from 'fs'

import { variantPlaylist } from '~/@types'
import { convertToHLS, generateThumbnail } from './ffmpeg'
import { options } from '~/config/videoResolutionOptions'
import { storeFile } from './storage'
import intoStream from 'into-stream'

type uploadVideoType = (video: Buffer) => Promise<{
  videoUrl: string
  thumbnailUrl: string
}>

export const uploadVideo: uploadVideoType = async video => {
  console.log('Start store file')
  console.time('req_time')
  const id = v1()
  const videoPath = './local.mov'
  fs.writeFileSync('local.mov', video)

  let variantPlaylists: variantPlaylist[] = []

  return new Promise(async (resolve, reject) => {
    // Convert video to HLS with multiple resolutions
    for (const option of options) {
      const { resolution, videoBitrate, audioBitrate } = option
      const fileNamePrefix = id + '_' + resolution

      try {
        // Convert video to HLS using ffmpeg
        const manifestBuffer = await convertToHLS(
          videoPath,
          id,
          videoBitrate,
          audioBitrate,
          resolution
        )

        // Update manifest to can trigger segment files from firebase storage
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

        // Save current resolution manifest
        await storeFile(manifestFile, 'hls/' + fileNamePrefix + '.m3u8', 'audio/x-mpegurl')

        // Save video chunks
        const chunkFiles = fs
          .readdirSync('.')
          .filter(fileName => fileName.startsWith(fileNamePrefix))

        for (const fileName of chunkFiles) {
          const fileBuffer = fs.readFileSync(`${fileName}`)

          try {
            await storeFile(fileBuffer, 'hls/' + fileName, 'text/vnd.trolltech.linguist')
          } catch (error) {
            console.log('==> error when store segment file', error)
            reject(error)
          } finally {
            fs.unlinkSync(fileName)
          }
        }

        // Get video chunks URLs
        variantPlaylists.push({
          resolution,
          outPutFileName: `${fileNamePrefix}.m3u8`
        })

        console.log('==> done encode:', resolution)
      } catch (error) {
        console.log('==> error convert to hls', error)
        reject(error)
      }
    }

    // Generate master playlist manifest
    let masterPlaylist = variantPlaylists
      .map(({ resolution, outPutFileName }) => {
        const bandwidth =
          resolution === '320x180' ? 676800 : resolution === '640x360' ? 1353600 : 3230400

        return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution},SUBTITLES="subs"\nhls%2F${outPutFileName}?alt=media`
      })
      .join('\n')

    masterPlaylist = `#EXTM3U\n ${masterPlaylist}`

    try {
      // Save master playlist manifest
      const fileUrl = (await storeFile(
        masterPlaylist,
        'hls/' + id + '_master.m3u8',
        'audio/x-mpegurl',
        true
      )) as string

      // Generate video thumbnail
      await generateThumbnail(videoPath)
      const thumbnailBuffer = fs.readFileSync('local.png')
      const thumbnailUrl = (await storeFile(
        thumbnailBuffer,
        'thumbnails/' + id + '.png',
        'image/png',
        true
      )) as string

      console.timeEnd('req_time')
      resolve({ videoUrl: fileUrl, thumbnailUrl })
    } catch (error) {
      console.log('==> error when store master playlist', error)
      reject(error)
    } finally {
      // Remove local video file
      fs.unlinkSync('local.mov')
      fs.unlinkSync('local.png')
    }
  })
}
