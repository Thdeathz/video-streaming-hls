import admin from 'firebase-admin'

type addUploadLogMessageType = (documentName: string, logMessage: string) => Promise<null>

export const addUploadLogMessage: addUploadLogMessageType = async (documentName, logMessage) => {
  const db = admin.firestore()

  return new Promise(async (resolve, reject) => {
    try {
      await db.collection('uploadProcess').doc(documentName).create({ message: logMessage })

      resolve(null)
    } catch (error) {
      reject(error)
    }
  })
}
