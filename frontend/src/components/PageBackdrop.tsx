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
      {priority ? (
        <Image
          src={src}
          alt=""
          width={1920}
          height={1080}
          priority
          quality={90}
          className="hidden"
        />
      ) : null}
      <div
        className="quantis-backdrop-stitch absolute inset-0"
        style={{ backgroundImage: `url("${src}")` }}
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  )
}
