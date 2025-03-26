import { Github, Twitter, Instagram } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {/* Social Links */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <Link
              href="https://github.com/santos-404"
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-full bg-zinc-800/50 p-1.5 shadow-lg shadow-zinc-900/5 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-zinc-900/10"
            >
              <Github className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-100" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap min-w-[120px] text-center">
                GitHub - santos-404
              </span>
            </Link>
            <Link
              href="https://x.com/javierrsantoss"
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-full bg-zinc-800/50 p-1.5 shadow-lg shadow-zinc-900/5 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-zinc-900/10"
            >
              <Twitter className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-100" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap min-w-[120px] text-center">
                Twitter - javierrsantoss
              </span>
            </Link>
            <span className="text-zinc-600 inline">|</span>
            <Link
              href="https://instagram.com/darioordgz"
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-full bg-zinc-800/50 p-1.5 shadow-lg shadow-zinc-900/5 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-zinc-900/10"
            >
              <Instagram className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-100" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap min-w-[120px] text-center">
                Instagram - darioordgz
              </span>
            </Link>
            <Link
              href="https://github.com/darrodsas"
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-full bg-zinc-800/50 p-1.5 shadow-lg shadow-zinc-900/5 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-zinc-900/10"
            >
              <Github className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-100" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap min-w-[120px] text-center">
                GitHub - darrodsas
              </span>
            </Link>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap justify-center sm:justify-end">
            <span>Built with {"<3"} by</span>
            <Link
              href="https://github.com/santos-404"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-300 transition-colors hover:text-white"
            >
              santos-404
            </Link>
            <span>and</span>
            <Link
              href="https://github.com/darrodsas"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-300 transition-colors hover:text-white"
            >
              darrodsas
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              href="https://github.com/santos-404/vibescii"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-300 transition-colors hover:text-white"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 