import React, { createContext, useCallback, useContext, useState } from 'react'

const ConfirmContext = createContext()

// useConfirm() returns an async function: await confirm({...}) -> true/false.
export const useConfirm = () => useContext(ConfirmContext)

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  tone: 'primary', // 'primary' | 'danger'
}

const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setDialog({ ...DEFAULTS, ...options, resolve })
      }),
    []
  )

  const close = (result) => {
    if (dialog) dialog.resolve(result)
    setDialog(null)
  }

  const confirmBtn =
    dialog?.tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-blue-600 hover:bg-blue-700'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
          onClick={() => close(false)}
        >
          <div
            className='bg-white rounded-xl shadow-xl max-w-sm w-full p-6'
            onClick={(e) => e.stopPropagation()}
          >
            <p className='text-lg font-semibold text-gray-800'>{dialog.title}</p>
            {dialog.message && (
              <p className='text-sm text-gray-600 mt-2'>{dialog.message}</p>
            )}
            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={() => close(false)}
                className='px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50'
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={() => close(true)}
                className={`px-5 py-2 rounded-full text-white text-sm ${confirmBtn}`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export default ConfirmProvider
