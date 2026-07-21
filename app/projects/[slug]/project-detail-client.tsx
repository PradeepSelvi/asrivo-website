"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Code, 
  Database, 
  Server, 
  Cloud, 
  FileText,
  Check,
  Users,
  Calendar,
  Download,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface Project {
  id: number
  title: string
  slug: string
  description: string
  long_description: string | null
  category: string
  client_name: string | null
  technologies: string[]
  image_url: string | null
  featured_image_url: string | null
  live_url: string | null
  github_url: string | null
  status: string
  frontend_tech: string | null
  backend_tech: string | null
  database_tech: string | null
  infrastructure: string | null
  key_features: string[] | null
  challenge: string | null
  solution: string | null
  results: string[] | null
  team_size: number | null
  duration: string | null
  prd_file_url: string | null
  prd_file_name: string | null
  gallery_images: string[] | null
  created_at: string
  updated_at: string
}

export default function ProjectDetailClient({ project: initialProject }: { project: Project }) {
  const [project, setProject] = useState<Project>(initialProject)
  const [prdContent, setPrdContent] = useState<string | null>(null)
  const [showPrdModal, setShowPrdModal] = useState(false)
  const [loadingPrd, setLoadingPrd] = useState(false)

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`project-${project.slug}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `slug=eq.${project.slug}`,
        },
        (payload) => {
          console.log('Project updated in realtime:', payload)
          setProject(payload.new as Project)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [project.slug])

  const fetchPrdContent = async () => {
    if (!project.prd_file_url) return

    setLoadingPrd(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('project-prds')
        .download(project.prd_file_url)

      if (error) throw error

      const text = await data.text()
      setPrdContent(text)
      setShowPrdModal(true)
    } catch (error) {
      console.error('Error fetching PRD:', error)
      alert('Failed to load PRD document')
    } finally {
      setLoadingPrd(false)
    }
  }

  const downloadPrd = async () => {
    if (!project.prd_file_url) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('project-prds')
        .download(project.prd_file_url)

      if (error) throw error

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = project.prd_file_name || 'PRD.md'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PRD:', error)
      alert('Failed to download PRD')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'ongoing': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'planned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                {project.category && (
                  <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                    {project.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 break-words">{project.title}</h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4 break-words">{project.description}</p>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {project.team_size && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{project.team_size} Team Members</span>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{project.duration}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {project.live_url && (
                <Button asChild size="sm" className="text-xs sm:text-sm">
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Live Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button variant="outline" asChild size="sm" className="text-xs sm:text-sm">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">GitHub</span>
                    <span className="sm:hidden">Code</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Image */}
            {project.featured_image_url && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
                <img
                  src={project.featured_image_url}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Long Description */}
            {project.long_description && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Project</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.long_description}
                </p>
              </div>
            )}

            {/* Challenge */}
            {project.challenge && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">Challenge</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.challenge}
                </p>
              </div>
            )}

            {/* Solution */}
            {project.solution && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">Solution</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.solution}
                </p>
              </div>
            )}

            {/* Results */}
            {project.results && project.results.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">Results</h2>
                <ul className="space-y-3">
                  {project.results.map((result, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Features */}
            {project.key_features && project.key_features.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">Key Features</h2>
                <ul className="space-y-3">
                  {project.key_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PRD Document */}
            {project.prd_file_url && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Product Requirements</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadPrd}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  View the complete Product Requirements Document for this project.
                </p>
                <Button onClick={fetchPrdContent} disabled={loadingPrd}>
                  <FileText className="w-4 h-4 mr-2" />
                  {loadingPrd ? 'Loading...' : 'View PRD'}
                </Button>
              </div>
            )}

            {/* Image Gallery */}
            {project.gallery_images && project.gallery_images.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.gallery_images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={image}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tech Stack Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Tech Stack</h3>
              <div className="space-y-4">
                {project.frontend_tech && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Frontend</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{project.frontend_tech}</p>
                  </div>
                )}
                {project.backend_tech && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Backend</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{project.backend_tech}</p>
                  </div>
                )}
                {project.database_tech && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Database</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{project.database_tech}</p>
                  </div>
                )}
                {project.infrastructure && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Infrastructure</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{project.infrastructure}</p>
                  </div>
                )}
              </div>

              {/* Technologies Tags */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Info */}
              {project.client_name && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Client</h4>
                  <p className="text-sm text-muted-foreground">{project.client_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRD Modal */}
      {showPrdModal && prdContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Product Requirements Document</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPrdModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-foreground mb-4 mt-8" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-foreground mb-3 mt-6" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-foreground mb-2 mt-4" {...props} />,
                    p: ({ node, ...props }) => <p className="text-muted-foreground mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2" {...props} />,
                    code: ({ node, inline, ...props }: any) => 
                      inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />
                      ) : (
                        <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                      ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />
                    ),
                  }}
                >
                  {prdContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realtime Indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg text-xs">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-muted-foreground">Live Updates</span>
      </div>
    </div>
  )
}
