interface HomeProps {
  isAuthenticated: boolean
}

export default function Home({ isAuthenticated }: HomeProps) {
  return (
    <div className="bg-white min-h-[calc(100vh-4rem)]">
      {/* Empty home page - only navigation will be visible */}
    </div>
  )
}
