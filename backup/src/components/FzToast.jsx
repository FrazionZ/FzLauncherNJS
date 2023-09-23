import { toast } from 'react-toastify'

import BubbleError from '../assets/img/icons/bubble_error.svg'
import BubbleSuccess from '../assets/img/icons/bubble_success.svg'
import BubbleInfos from '../assets/img/icons/bubble_infos.svg'
import BubbleWarning from '../assets/img/icons/bubble_warning.svg'

const options = (state) => {
  let options = {
    position: toast.POSITION.TOP_CENTER,
    theme: 'dark',
    icon: () => {
      switch (state) {
        case 0:
          return <img src={BubbleError} />
        case 1:
          return <img src={BubbleSuccess} />
        case 2:
          return <img src={BubbleInfos} />
        case 3:
          return <img src={BubbleWarning} />
        default:
          return <img src={BubbleInfos} />
      }
    }
  }
  if (state == -1) delete options.icon
  return options
}

const processToast = (pendingMessage, callPromise, callSuccess, callError) => {
  return toast.promise(
    callPromise,
    {
      pending: pendingMessage,
      success: {
        render({ data }) {
          return callSuccess(data)
        },
        icon: () => <img src={BubbleSuccess} />
      },
      error: {
        render({ data }) {
          return callError(data)
        },
        icon: () => <img src={BubbleError} />
      }
    },
    options(-1)
  )
}

const error = (message) => {
  return toast.error(message, options(0))
}

const success = (message) => {
  return toast.success(message, options(1))
}

const info = (message) => {
  return toast.info(message, options(2))
}

const warning = (message) => {
  return toast.warning(message, options(3))
}

export default { processToast, error, success, info, warning }
