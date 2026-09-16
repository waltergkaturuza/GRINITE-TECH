'use client'

import { useRouter } from 'next/navigation'
import Modal from './Modal'

interface SignupModalProps {
  isOpen: boolean
  closeModal: () => void
  openLoginModal: () => void
}

export default function SignupModal({ isOpen, closeModal, openLoginModal }: SignupModalProps) {
  const router = useRouter()

  const goToContact = () => {
    closeModal()
    router.push('/contact')
  }

  const switchToLogin = () => {
    closeModal()
    openLoginModal()
  }

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title="Work with Quantis">
      <div className="space-y-6">
        <p className="text-gray-300 leading-relaxed">
          Clients do not create login accounts. Quantis adds you as the contact person on your
          project, invoices, quotations, and receipts.
        </p>
        <p className="text-gray-400 text-sm">
          Send a brief and we will get in touch. Staff and developers sign in separately.
        </p>
        <button
          type="button"
          onClick={goToContact}
          className="w-full bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
        >
          Contact Quantis
        </button>
        <p className="text-center text-gray-300 text-sm">
          Staff or developer?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-cyan-400 hover:text-yellow-400 font-medium transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </Modal>
  )
}
