import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="pt-16 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">This page does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
        Back to home
      </Link>
    </div>
  )
}
