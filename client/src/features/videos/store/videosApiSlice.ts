import { createEntityAdapter, createSelector } from '@reduxjs/toolkit'

import apiSlice from '~/app/api/apiSlice'
import { RootState } from '~/app/store'

const videosAdapter = createEntityAdapter<Video>({})

const initialState = videosAdapter.getInitialState()

export const videosApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getVideos: builder.query({
      query: () => ({
        url: '/videos',
        validateStatus: (response: Response, result: ApiResult) =>
          response.status === 200 && !result.isError
      }),
      transformResponse: (response: ApiResponse<(Video & { _id: string })[]>) => {
        if (!response || !response.data) return

        const loaderVideos: Video[] = response.data.map(video => {
          video.id = video._id
          return video as Video
        })

        return videosAdapter.setAll(initialState, loaderVideos)
      },
      providesTags: result => {
        if (result?.ids) {
          return [
            { type: 'Video', id: 'LIST' },
            ...result.ids.map(id => ({ type: 'Video' as const, id }))
          ]
        } else return [{ type: 'Video', id: 'LIST' }]
      }
    }),

    uploadVideo: builder.mutation({
      query: (formData: FormData) => ({
        url: '/videos/upload',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: [{ type: 'Video', id: 'LIST' }]
    })
  })
})

export const { useGetVideosQuery, useUploadVideoMutation } = videosApiSlice

export const selectVideosResult = videosApiSlice.endpoints.getVideos.select(undefined)

const selectVideosData = createSelector(
  selectVideosResult,
  videosResult => videosResult.data as NonNullable<typeof videosResult.data>
)

export const {
  selectAll: selectAllVideos,
  selectById: selectVideoById,
  selectIds: selectVideoIds
} = videosAdapter.getSelectors((state: RootState) => selectVideosData(state) ?? initialState)
