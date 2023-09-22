export interface UserData {
  id?: Types.ObjectId
  email: string
  password?: string
  roles?: ROLE[]
  active?: boolean
}

export type ROLE = ['Admin' | 'User']

export type variantPlaylist = {
  resolution: string
  outPutFileName: string
}
