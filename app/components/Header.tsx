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
    <header className={`text-center mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl transition-all duration-300 ${compact ? 'py-8' : 'py-12'}`}>
      <h1 className={`${compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl'} font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight`}>
        {title.includes("RHD Blog") ? (
          <>Welcome to <span className="text-blue-600 dark:text-blue-400">RHD Blog</span></>
        ) : (
          title
        )}
      </h1>
      <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4`}>
        {subtitle}
      </p>
    </header>
  );
}
