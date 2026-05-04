import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export interface ProjectShowcaseItem {
  id: string
  title: string
  img: string
  description: string
  content: string
  slug: string
}

export function ProjectShowcase({
  projects,
}: {
  projects: ProjectShowcaseItem[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const selectedProject = projects.find((p) => p.id === selectedId)
  const activeImageProject =
    selectedProject || projects.find((p) => p.id === hoveredId) || projects[0]

  return (
    <div className="relative min-h-screen w-full text-foreground overflow-hidden">
      <AnimatePresence>
        {!selectedId && (
          <motion.div
            className="absolute inset-0 px-4 sm:px-6 flex flex-col md:flex-row justify-between pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left side preview */}
            <div className="w-[45vw] md:w-[40vw] lg:w-[45vw] max-w-3xl aspect-4/3 xl:aspect-video relative hidden sm:block pointer-events-auto shrink-0 my-auto">
              {activeImageProject && (
                <motion.img
                  key={`preview-${activeImageProject.id}`}
                  layoutId={`image-${activeImageProject.id}`}
                  src={activeImageProject.img}
                  alt={activeImageProject.title}
                  className="w-full h-full object-center rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10"
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              )}
            </div>

            {/* Right side list */}
            <div className="flex flex-col mt-auto items-start sm:items-end pointer-events-auto z-10 w-full md:w-3/5 h-full md:h-96 overflow-y-auto scrollbar-hide">
              <Link
                to="/projects"
                className="text-primary hover:underline underline-offset-8 font-serif mb-4 font-light text-lg cursor-pointer flex items-center gap-2 group"
              >
                <span>View All Projects</span>
                <ArrowRight className='h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300' />
              </Link>
              <ul className="flex flex-col w-fit text-right gap-2 sm:gap-4 pb-10">
                {projects.map((project) => {
                  const isHovered = hoveredId === project.id
                  const isDimmed =
                    hoveredId !== null && hoveredId !== project.id

                  return (
                    <li
                      key={project.id}
                      className="group flex justify-start sm:justify-end"
                      onMouseEnter={() => setHoveredId(project.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(project.id)}
                    >
                      <motion.h3
                        layoutId={`title-${project.id}`}
                        className={`text-4xl font-serif cursor-pointer transition-colors duration-400 select-none ${
                          isDimmed
                            ? 'text-muted-foreground/40'
                            : isHovered
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {project.title}
                      </motion.h3>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center overflow-y-auto scrollbar-hide sm:mt-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-6 mb-10 w-full max-w-5xl justify-center relative mt-4 md:mt-8">
              <button
                onClick={() => setSelectedId(null)}
                className="absolute left-0 sm:left-8 text-neutral-400 hover:text-white transition-colors p-4 cursor-pointer"
                aria-label="Close"
              >
                <div className="w-8 h-[2px] bg-current" />
              </button>

              <motion.h3
                layoutId={`title-${selectedProject.id}`}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-foreground text-center leading-[1.1] max-w-3xl"
              >
                {selectedProject.title}
              </motion.h3>

              <button
                onClick={() => setSelectedId(null)}
                className="sm:hidden absolute right-0 text-neutral-400 hover:text-white transition-colors p-4 cursor-pointer"
                aria-label="Close"
              >
                <div className="w-8 h-[2px] bg-current" />
              </button>
            </div>

            <motion.div
              className="w-full max-w-5xl aspect-17/18 sm:aspect-21/9 relative cursor-pointer group rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 shrink-0"
              onClick={() => setSelectedId(null)}
              style={{ filter: 'url(#SquiCircleFilter)' }}
            >
              <motion.img
                layoutId={`image-${selectedProject.id}`}
                src={selectedProject.img}
                alt={selectedProject.title}
                className="w-full h-full object-center sm:object-cover"
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-xs uppercase tracking-[0.2em] font-medium bg-black/40 px-5 py-2.5 rounded-full backdrop-blur-md">
                  Close Preview
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                delay: 0.25,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-4 max-w-3xl text-justify flex flex-col items-center pb-10 text-foreground gap-4"
            >
              <h4 className="text-sm font-medium mb-2">
                {selectedProject.description}
              </h4>

              <Link
                to="/projects/$slug"
                params={{ slug: selectedProject.slug }}
                className=""
              >
                View full case study
                <span className="text-lg leading-none">&rarr;</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
