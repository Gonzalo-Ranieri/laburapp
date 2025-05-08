import type React from "react"
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="provider-layout">{children}</div>
}
