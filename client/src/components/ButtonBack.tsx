import React from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

type PropsType = {
  className?: string
}

const ButtonBack = ({ className }: PropsType) => {
  const navigate = useNavigate()

  return (
    <button
      className={`flex-center gap-2 transition-colors hover:text-primary-5 ${className}`}
      onClick={() => navigate(-1)}
    >
      <ArrowLeftOutlined />
      Back
    </button>
  )
}

export default ButtonBack
