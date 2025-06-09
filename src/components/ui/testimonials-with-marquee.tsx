
import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
import { motion } from 'framer-motion'
import { SparklesText } from "@/components/ui/sparkles-text"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-black text-white",
      "py-12 sm:py-24 md:py-32 px-4",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full mb-6" 
            initial={{ opacity: 0, scale: 0.8 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SparklesText 
              text="Testimonials" 
              className="text-sm font-medium text-black"
              sparklesCount={3}
              colors={{ first: "#3B82F6", second: "#8B5CF6" }}
            />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {title}
          </h2>          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {description}          </p>        </motion.div>        <div className="relative w-full overflow-hidden py-8">          <div className="group flex overflow-hidden [--gap:30px] [gap:var(--gap)] flex-row [--duration:30s] relative w-full">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`first-${i}`}
                  {...testimonial}
                />
              ))}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`second-${i}`}
                  {...testimonial}
                />
              ))}
            </div>
            
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`third-${i}`}
                  {...testimonial}
                />
              ))}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`fourth-${i}`}
                  {...testimonial}
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-black sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-black sm:block" />
        </div>
      </div>
    </section>
  )
}
