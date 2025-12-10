import { LoginFormSupabase } from "@/components/auth/login-form-supabase"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <LoginFormSupabase />
    </div>
  )
}
