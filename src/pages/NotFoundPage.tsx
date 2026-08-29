import { Link } from 'react-router-dom'
import primitives from '../styles/primitives.module.css'

export function NotFoundPage() {
  return (
    <div className={primitives.card}>
      <h2>Page not found</h2>
      <p>
        <Link to="/" className={primitives.link}>
          Back to Overview
        </Link>
      </p>
    </div>
  )
}
