'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  closeModal: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, closeModal, title, children }: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-visible rounded-3xl bg-gray-900/80 backdrop-blur-xl p-8 text-left align-middle shadow-2xl transition-all border border-white/50 relative min-h-[700px]">
                {/* Animated Background Rings - All Rings 5mm Wider */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                  <div className="relative">
                    {/* Outer Ring - Extra 5mm wider (≈ 20px) */}
                    <div className="w-[610px] h-[610px] border-4 border-transparent rounded-full animate-spin-slow">
                      <div className="w-full h-full border-4 border-dashed border-t-cyan-300 border-r-blue-300 border-b-indigo-300 border-l-purple-300 rounded-full animate-spin-reverse opacity-90 shadow-xl shadow-cyan-400/30"></div>
                    </div>
                    {/* Middle Ring - Extra 5mm wider */}
                    <div className="absolute top-16 left-16 w-[515px] h-[515px] border-2 border-transparent rounded-full animate-spin-slow-reverse">
                      <div className="w-full h-full border-2 border-dotted border-t-yellow-300 border-r-orange-300 border-b-red-300 border-l-pink-300 rounded-full animate-spin opacity-80 shadow-xl shadow-yellow-400/30"></div>
                    </div>
                    {/* Inner Ring - Extra 5mm wider */}
                    <div className="absolute top-32 left-32 w-[420px] h-[420px] border-2 border-transparent rounded-full animate-pulse">
                      <div className="w-full h-full border-2 border-solid border-t-emerald-300 border-r-green-300 border-b-lime-300 border-l-teal-300 rounded-full animate-spin-slow opacity-70 shadow-xl shadow-green-400/30"></div>
                    </div>
                    {/* Center Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-300/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-yellow-300/15 to-pink-300/15 rounded-full blur-xl animate-ping"></div>
                  </div>
                </div>

                {/* Enhanced Glass Morphism Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full blur-2xl"></div>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Modal Content */}
                <div className="relative z-20 flex items-center justify-center min-h-[550px]">
                  <div className="w-full max-w-md">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-white text-center mb-6"
                    >
                      {title}
                    </Dialog.Title>
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}