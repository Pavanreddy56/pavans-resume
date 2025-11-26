import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Download,
  Send,
  Lock,
  Calendar,
  ArrowRight,
  Cloud,
  Server,
  Container,
  Code,
  Terminal,
  Database,
  Menu,
  X,
} from "lucide-react";
import type { Hero, Skill, Project, BlogPost, SocialLink, Resume } from "@shared/schema";
import { useState } from "react";
import profileImage from "@assets/WhatsApp Image 2025-09-09 at 11.21.43 AM_1764162148262.jpeg";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const skillIcons: Record<string, typeof Cloud> = {
  "Cloud Platforms": Cloud,
  "Containerization": Container,
  "CI/CD": Terminal,
  "Infrastructure": Server,
  "Programming": Code,
  "Databases": Database,
};

function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-xl font-bold text-foreground"
            data-testid="link-logo"
          >
            PR<span className="text-primary">.</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("skills")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-nav-skills"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-nav-projects"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection("blog")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-nav-blog"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-nav-contact"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("skills")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                data-testid="link-mobile-skills"
              >
                Skills
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                data-testid="link-mobile-projects"
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection("blog")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                data-testid="link-mobile-blog"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                data-testid="link-mobile-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function HeroSection() {
  const { data: hero, isLoading: heroLoading } = useQuery<Hero>({
    queryKey: ["/api/hero"],
  });

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: resume } = useQuery<Resume>({
    queryKey: ["/api/resume"],
  });

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Github className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            {heroLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm font-medium text-primary uppercase tracking-wide">
                  Welcome to my portfolio
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  {hero?.name || "Pavan Reddy Cheedeti"}
                </h1>
                <h2 className="text-xl md:text-2xl font-medium text-muted-foreground">
                  {hero?.title || "DevOps Engineer"}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {hero?.intro ||
                    "Cloud enthusiast with 2+ years of experience in DevOps, specializing in AWS, Docker, Kubernetes, and CI/CD pipelines. Passionate about automating infrastructure and streamlining deployment processes."}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  {socialLinks?.map((link) => (
                    <a
                      key={link.id}
                      href={link.platform.toLowerCase() === "email" ? `mailto:${link.url}` : link.url}
                      target={link.platform.toLowerCase() === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="p-2 rounded-md bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      data-testid={`link-social-${link.platform.toLowerCase()}`}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  {resume && (
                    <a href={`/api/resume/download`} download>
                      <Button data-testid="button-download-resume">
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const contactSection = document.getElementById("contact");
                      contactSection?.scrollIntoView({ behavior: "smooth" });
                    }}
                    data-testid="button-get-in-touch"
                  >
                    Get in Touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-full blur-3xl" />
              <Avatar className="h-64 w-64 md:h-80 md:w-80 border-4 border-primary/20 relative">
                <AvatarImage
                  src={hero?.profileImage || profileImage}
                  alt={hero?.name || "Pavan Reddy"}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                  PR
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const groupedSkills = skills?.reduce(
    (acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  return (
    <section id="skills" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Technical Skills
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit for building and maintaining cloud infrastructure, automating deployments, and ensuring system reliability.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-6 w-20" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedSkills &&
              Object.entries(groupedSkills).map(([category, categorySkills]) => {
                const IconComponent = skillIcons[category] || Code;
                return (
                  <Card key={category} className="hover-elevate">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className="font-mono text-xs"
                            data-testid={`badge-skill-${skill.id}`}
                          >
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectsSection() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of projects showcasing my experience in DevOps, cloud infrastructure, and automation.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden hover-elevate group"
                data-testid={`card-project-${project.id}`}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Server className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack?.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`link-project-github-${project.id}`}
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`link-project-live-${project.id}`}
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Server className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No projects to display yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function BlogSection() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const publishedPosts = posts?.filter((post) => post.published);

  return (
    <section id="blog" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Blog
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on DevOps, cloud computing, and automation.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : publishedPosts && publishedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map((post) => (
              <Card
                key={post.id}
                className="hover-elevate"
                data-testid={`card-blog-${post.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>
                  <button
                    className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    data-testid={`link-blog-read-${post.id}`}
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection() {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const emailLink = socialLinks?.find(
    (link) => link.platform.toLowerCase() === "email"
  );

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or want to discuss DevOps solutions? I'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            {...field}
                            data-testid="input-contact-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            {...field}
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell me about your project or question..."
                            className="min-h-32 resize-none"
                            {...field}
                            data-testid="input-contact-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMutation.isPending}
                    data-testid="button-contact-submit"
                  >
                    {submitMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Contact Information
              </h3>
              <div className="space-y-4">
                {emailLink && (
                  <a
                    href={`mailto:${emailLink.url}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="link-contact-email"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span>{emailLink.url}</span>
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Connect with Me
              </h3>
              <div className="flex gap-4">
                {socialLinks?.map((link) => (
                  <a
                    key={link.id}
                    href={
                      link.platform.toLowerCase() === "email"
                        ? `mailto:${link.url}`
                        : link.url
                    }
                    target={link.platform.toLowerCase() === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="p-3 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    data-testid={`link-contact-social-${link.platform.toLowerCase()}`}
                  >
                    {link.platform.toLowerCase() === "github" && (
                      <Github className="h-5 w-5" />
                    )}
                    {link.platform.toLowerCase() === "linkedin" && (
                      <Linkedin className="h-5 w-5" />
                    )}
                    {link.platform.toLowerCase() === "email" && (
                      <Mail className="h-5 w-5" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                I typically respond within 24-48 hours. Looking forward to connecting with you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pavan Reddy Cheedeti. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks?.map((link) => (
              <a
                key={link.id}
                href={
                  link.platform.toLowerCase() === "email"
                    ? `mailto:${link.url}`
                    : link.url
                }
                target={link.platform.toLowerCase() === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`link-footer-${link.platform.toLowerCase()}`}
              >
                {link.platform.toLowerCase() === "github" && (
                  <Github className="h-5 w-5" />
                )}
                {link.platform.toLowerCase() === "linkedin" && (
                  <Linkedin className="h-5 w-5" />
                )}
                {link.platform.toLowerCase() === "email" && (
                  <Mail className="h-5 w-5" />
                )}
              </a>
            ))}
          </div>
          <Link href="/admin" data-testid="link-admin-login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Lock className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <SkillsSection />
        <ProjectsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
