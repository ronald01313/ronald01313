interface HeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function Header({ 
  title = "My Blog", 
  subtitle = "Thoughts, stories, and ideas",
  compact = false
}: HeaderProps) {
  return (
    <header className={`text-center mb-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl transition-all duration-500 shadow-sm ${compact ? 'py-8' : 'py-12'}`}>
      <h1 className={`${compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl'} font-black text-zinc-900 dark:text-white mb-4 tracking-tighter`}>
        {title.includes("RHD Blog") ? (
          <>Welcome to <span className="text-blue-600 dark:text-blue-500">RHD Blog</span></>
        ) : (
          title
        )}
      </h1>
      <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-4 font-medium`}>
        {subtitle}
      </p>
    </header>
  );
}
