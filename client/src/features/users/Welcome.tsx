import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tooltip, message } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

import useAuth from '~/hooks/useAuth'
import { DefaultLayout } from '~/components'
import { useSendLogoutMutation } from '../auth/store/authApiSlice'

const Welcome = () => {
  const navigate = useNavigate()
  const { email, roles } = useAuth()

  const [sendLogout] = useSendLogoutMutation()

  const onLogout = async () => {
    try {
      await sendLogout(undefined)
      message.success('Logout successfully!')
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DefaultLayout>
      <div className="min-w-[24rem] max-w-[24rem] break-words rounded">
        <div className="flex items-start justify-between">
          <p>
            Logged in as: {email}
            <br />
            Roles: {roles?.join(', ')}
          </p>

          <Tooltip title="logout" arrow={false}>
            <LogoutOutlined
              className="text-xl transition-colors hover:text-primary-5"
              onClick={onLogout}
            />
          </Tooltip>
        </div>

        <div className="flex w-full items-center justify-start gap-2">
          <Button type="primary" ghost onClick={() => navigate('/upload')}>
            Upload
          </Button>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default Welcome
