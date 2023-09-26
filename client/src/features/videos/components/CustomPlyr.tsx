import React, { MutableRefObject, forwardRef } from 'react'
import { APITypes, PlyrProps, usePlyr } from 'plyr-react'
import useHls from '~/hooks/useHls'

const CustomPlyr = forwardRef<APITypes, PlyrProps & { hlsSource: string; className?: string }>(
  (props, ref) => {
    const { source, options = null, hlsSource, className } = props

    const raptorRef = usePlyr(ref, {
      ...useHls(hlsSource, options),
      source
    }) as MutableRefObject<HTMLVideoElement>

    return <video ref={raptorRef} className={`plyr-react plyr ${className}`} />
  }
)

export default CustomPlyr
