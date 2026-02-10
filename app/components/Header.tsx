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
    <header className={`text-center mb-16 ${compact ? 'py-8' : 'py-20'}`}>
      <h1 className={`${compact ? 'text-4xl' : 'text-5xl md:text-7xl'} font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight`}>
        {title.includes("RHD Blog") ? (
          <>The <span className="text-blue-600">RHD</span> Journal</>
        ) : (
          title
        )}
      </h1>
      <p className={`${compact ? 'text-base' : 'text-xl'} text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto px-4 font-normal leading-relaxed`}>
        {subtitle}
      </p>
    </header>
  );
}
