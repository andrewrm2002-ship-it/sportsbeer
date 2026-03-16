export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <span className="text-5xl mb-6 animate-bounce">&#x1F37A;</span>
      <p className="text-text-secondary text-lg font-medium mb-8">
        Pouring your content...
      </p>
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 rounded-lg skeleton" />
        <div className="h-4 rounded-lg skeleton w-3/4 mx-auto" />
        <div className="h-4 rounded-lg skeleton w-1/2 mx-auto" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="h-32 rounded-xl skeleton" />
          <div className="h-32 rounded-xl skeleton" />
          <div className="h-32 rounded-xl skeleton" />
        </div>
      </div>
    </div>
  );
}
