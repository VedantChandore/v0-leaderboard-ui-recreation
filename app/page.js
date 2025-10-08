import { Leaderboard } from "../components/leaderboard"
import { ProtectedRoute } from "../components/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  )
}