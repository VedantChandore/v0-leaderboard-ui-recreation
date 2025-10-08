import { SimpleLeaderboard } from "../components/SimpleLeaderboard"
import { ProtectedRoute } from "../components/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <SimpleLeaderboard />
    </ProtectedRoute>
  )
}