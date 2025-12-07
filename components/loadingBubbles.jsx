export default function LoadingBubbles() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}
