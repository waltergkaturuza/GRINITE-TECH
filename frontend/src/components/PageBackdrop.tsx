import Image from 'next/image'

type PageBackdropProps = {
  src: string
  priority?: boolean
  overlayClassName?: string
}

export default function PageBackdrop({
  src,
  priority = false,
  overlayClassName = 'bg-gradient-to-br from-granite-900/85 via-granite-800/75 to-crimson-950/80',
}: PageBackdropProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Cap the photo to one screen so tall pages don't crop a landscape image to a sliver. */}
      <div className="quantis-backdrop-frame absolute inset-x-0 top-0 h-full w-full">
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          quality={90}
          sizes="100vw"
          className="quantis-backdrop-img"
        />
      </div>
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  )
}
