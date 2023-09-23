import { getDownloadURL, getStorage } from 'firebase-admin/storage'

type storeFileType = (
  file: Buffer | string,
  fileName: string,
  contentType: string,
  isGetDownloadUrl?: boolean
) => Promise<string | null>

export const storeFile: storeFileType = async (file, fileName, contentType, isGetDownloadUrl) => {
  const bucket = getStorage().bucket()

  return new Promise(async (resolve, reject) => {
    try {
      const fileRef = bucket.file(fileName)
      await fileRef.save(file, {
        contentType,
        public: true
      })

      if (isGetDownloadUrl) {
        const downLoadUrl = await getDownloadURL(fileRef)
        resolve(downLoadUrl)
      }

      resolve(null)
    } catch (error) {
      reject(`Error while saving file: ${error}`)
    }
  })
}
