import primitives from '../styles/primitives.module.css'

export function ErrorState({ message }: { message: string }) {
  return <div className={primitives.mutedText}>Couldn&apos;t load this data: {message}</div>
}
