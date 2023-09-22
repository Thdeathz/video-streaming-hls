import { getDownloadURL, getStorage } from 'firebase-admin/storage'

export const storeFile = async (
  file: Buffer | string,
  fileName: string,
  contentType: string
): Promise<string> => {
  const bucket = getStorage().bucket()

  return new Promise(async (resolve, reject) => {
    try {
      const fileRef = bucket.file(fileName)
      await fileRef.save(file, {
        contentType,
        public: true
      })

      const downLoadUrl = await getDownloadURL(fileRef)
      resolve(downLoadUrl)
    } catch (error) {
      reject(`Error while saving file: ${error}`)
    }
  })
}
