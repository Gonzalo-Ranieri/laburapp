import { SignUpFormSupabase } from "@/components/auth/sign-up-form-supabase"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <SignUpFormSupabase />
    </div>
  )
}
