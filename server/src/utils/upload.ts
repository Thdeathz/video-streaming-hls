import { v1 } from 'uuid'
import fs from 'fs'
import tmp from 'tmp'

import { variantPlaylist } from '~/@types'
import { convertToHLS, generateThumbnail } from './ffmpeg'
import { options } from '~/config/videoResolutionOptions'
import { storeFile } from './storage'

type uploadVideoType = (video: Buffer, videoExtention: string) => any

export const uploadVideo: uploadVideoType = async (video, videoExtention) => {
  console.log('Start store file')
  console.time('req_time')
  const id = v1()

  return new Promise(async (resolve, reject) => {
    tmp.dir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
      if (err) reject(err)

      const videoPath = path + '/local.' + videoExtention
      fs.writeFileSync(videoPath, video)

      let variantPlaylists: variantPlaylist[] = []
      for (const option of options) {
        const { resolution, videoBitrate, audioBitrate } = option
        const fileNamePrefix = id + '_' + resolution

        try {
          // Convert video to HLS using ffmpeg
          const manifestBuffer = await convertToHLS(
            videoPath,
            videoExtention,
            `${path}/${fileNamePrefix}`,
            videoBitrate,
            audioBitrate,
            resolution
          )

          // Update manifest to can trigger segment files from firebase storage
          let manifestFile: string[] = []
          for (const line of manifestBuffer.toString().split('\n')) {
            if (line.includes('.ts')) {
              manifestFile.push(`hls%2F${line}?alt=media`)
            } else {
              manifestFile.push(line)
            }

            if (line.includes('#EXT-X-ENDLIST')) break
          }

          // Save current resolution manifest
          await storeFile(
            manifestFile.join('\n'),
            'hls/' + fileNamePrefix + '.m3u8',
            'audio/x-mpegurl'
          )

          // Save video chunks
          const chunkFiles = fs
            .readdirSync(path)
            .filter(fileName => fileName.startsWith(fileNamePrefix))

          for (const fileName of chunkFiles) {
            const fileBuffer = fs.readFileSync(`${path}/${fileName}`)

            await storeFile(fileBuffer, 'hls/' + fileName, 'text/vnd.trolltech.linguist')
          }

          // Get video chunks URLs
          variantPlaylists.push({
            resolution,
            outPutFileName: `${fileNamePrefix}.m3u8`
          })

          console.log('==> done encode:', resolution)
        } catch (error) {
          console.log('==> error convert to hls', error)
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
        await generateThumbnail(videoPath, `${path}/local.png`)
        const thumbnailBuffer = fs.readFileSync(`${path}/local.png`)
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
        cleanupCallback()
      }
    })
  })
}
