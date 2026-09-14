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
    <div className="absolute inset-0" aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        quality={95}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  )
}
