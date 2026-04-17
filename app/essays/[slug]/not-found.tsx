import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-reading px-4 pb-16 pt-12 min-[481px]:px-6 md:px-8">
      <h1 className="mb-4 text-2xl font-bold text-red">Post not found</h1>
      <p className="mb-8 leading-[1.6] text-fg2">
        The post you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/about" className="text-sm text-blue">
        ← Back to About
      </Link>
    </div>
  )
}
