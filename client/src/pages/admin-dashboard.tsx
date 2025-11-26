import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
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
  LayoutDashboard,
  Code,
  FolderKanban,
  FileText,
  Link2,
  MessageSquare,
  FileDown,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  Menu,
  X,
  Home,
} from "lucide-react";
import type {
  Hero,
  Skill,
  Project,
  BlogPost,
  SocialLink,
  ContactMessage,
  Resume,
} from "@shared/schema";

type AdminTab =
  | "dashboard"
  | "hero"
  | "skills"
  | "projects"
  | "blog"
  | "social"
  | "messages"
  | "resume";

const skillCategories = [
  "Cloud Platforms",
  "Containerization",
  "CI/CD",
  "Infrastructure",
  "Programming",
  "Databases",
  "Other",
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout, token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/admin");
  };

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "hero", label: "Home Section", icon: Home },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "blog", label: "Blog Posts", icon: FileText },
    { id: "social", label: "Social Links", icon: Link2 },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "resume", label: "Resume", icon: FileDown },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-sidebar-foreground">
                Admin Panel
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                    data-testid={`button-admin-tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-site">
                <Eye className="mr-2 h-4 w-4" />
                View Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-open-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold capitalize">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "hero" && <HeroView token={token} />}
          {activeTab === "skills" && <SkillsView token={token} />}
          {activeTab === "projects" && <ProjectsView token={token} />}
          {activeTab === "blog" && <BlogView token={token} />}
          {activeTab === "social" && <SocialLinksView token={token} />}
          {activeTab === "messages" && <MessagesView token={token} />}
          {activeTab === "resume" && <ResumeView token={token} />}
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  const { data: skills } = useQuery<Skill[]>({ queryKey: ["/api/skills"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const { data: messages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/messages"],
  });

  const stats = [
    {
      label: "Skills",
      value: skills?.length || 0,
      icon: Code,
      color: "text-blue-500",
    },
    {
      label: "Projects",
      value: projects?.length || 0,
      icon: FolderKanban,
      color: "text-green-500",
    },
    {
      label: "Blog Posts",
      value: posts?.length || 0,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      label: "Messages",
      value: messages?.length || 0,
      icon: MessageSquare,
      color: "text-orange-500",
    },
  ];

  const unreadMessages = messages?.filter((m) => !m.read).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase()}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unreadMessages > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">
                  You have {unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your messages tab to respond
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HeroView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const { data: hero, isLoading } = useQuery<Hero>({
    queryKey: ["/api/hero"],
  });

  const heroSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
    intro: z.string().min(1, "Intro is required"),
    profileImage: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      name: "",
      title: "",
      intro: "",
      profileImage: "",
    },
  });

  useEffect(() => {
    if (hero) {
      form.reset({
        name: hero.name,
        title: hero.title,
        intro: hero.intro,
        profileImage: hero.profileImage || "",
      });
    }
  }, [hero, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof heroSchema>) => {
      return apiRequest("PUT", "/api/hero", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero"] });
      toast({ title: "Success", description: "Home section updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update home section",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Home Section</CardTitle>
        <CardDescription>
          Update your profile information displayed on the home page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-hero-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-hero-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-32 resize-none"
                      data-testid="input-hero-intro"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-hero-image" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-testid="button-save-hero"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SkillsView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const skillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
    category: z.string().min(1, "Category is required"),
    icon: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      icon: "",
    },
  });

  useEffect(() => {
    if (editingSkill) {
      form.reset({
        name: editingSkill.name,
        category: editingSkill.category || "",
        icon: editingSkill.icon || "",
      });
    } else {
      form.reset({ name: "", category: "", icon: "" });
    }
  }, [editingSkill, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skillSchema>) => {
      return apiRequest("POST", "/api/skills", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Success", description: "Skill added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skillSchema>) => {
      return apiRequest("PUT", `/api/skills/${editingSkill?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Success", description: "Skill updated successfully" });
      setIsDialogOpen(false);
      setEditingSkill(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/skills/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Success", description: "Skill deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof skillSchema>) => {
    if (editingSkill) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground">
          Manage your technical skills displayed on the portfolio
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingSkill(null)}
              data-testid="button-add-skill"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
              <DialogDescription>
                {editingSkill
                  ? "Update the skill details"
                  : "Add a new skill to your portfolio"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Docker, Kubernetes"
                          {...field}
                          data-testid="input-skill-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-skill-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skillCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-skill"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingSkill
                        ? "Update"
                        : "Add Skill"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-6 w-16" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groupedSkills && Object.keys(groupedSkills).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="group relative">
                      <Badge
                        variant="secondary"
                        className="pr-14 font-mono text-xs"
                        data-testid={`badge-admin-skill-${skill.id}`}
                      >
                        {skill.name}
                      </Badge>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingSkill(skill);
                            setIsDialogOpen(true);
                          }}
                          className="p-1 rounded bg-background hover:bg-muted"
                          data-testid={`button-edit-skill-${skill.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-1 rounded bg-background hover:bg-destructive/10 text-destructive"
                              data-testid={`button-delete-skill-${skill.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{skill.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(skill.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No skills added yet. Click "Add Skill" to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectsView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    techStack: z.string().min(1, "Tech stack is required"),
    githubUrl: z.string().url().optional().or(z.literal("")),
    liveUrl: z.string().url().optional().or(z.literal("")),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  });

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      techStack: "",
      githubUrl: "",
      liveUrl: "",
      image: "",
      featured: false,
    },
  });

  useEffect(() => {
    if (editingProject) {
      form.reset({
        title: editingProject.title,
        description: editingProject.description,
        techStack: editingProject.techStack?.join(", ") || "",
        githubUrl: editingProject.githubUrl || "",
        liveUrl: editingProject.liveUrl || "",
        image: editingProject.image || "",
        featured: editingProject.featured || false,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        techStack: "",
        githubUrl: "",
        liveUrl: "",
        image: "",
        featured: false,
      });
    }
  }, [editingProject, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const techStackArray = data.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return apiRequest("POST", "/api/projects", {
        ...data,
        techStack: techStackArray,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const techStackArray = data.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return apiRequest("PUT", `/api/projects/${editingProject?.id}`, {
        ...data,
        techStack: techStackArray,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project updated successfully" });
      setIsDialogOpen(false);
      setEditingProject(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/projects/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    if (editingProject) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground">
          Manage your portfolio projects
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingProject(null)}
              data-testid="button-add-project"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? "Update the project details"
                  : "Add a new project to showcase your work"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CI/CD Pipeline Automation"
                          {...field}
                          data-testid="input-project-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project..."
                          className="min-h-24 resize-none"
                          {...field}
                          data-testid="input-project-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Stack (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Docker, Jenkins, Terraform"
                          {...field}
                          data-testid="input-project-techstack"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/..."
                            {...field}
                            data-testid="input-project-github"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="liveUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Live URL (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            data-testid="input-project-live"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          data-testid="input-project-image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-project-featured"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Featured Project</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-project"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingProject
                        ? "Update"
                        : "Add Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden" data-testid={`card-admin-project-${project.id}`}>
              <div className="aspect-video bg-muted relative">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <FolderKanban className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                {project.featured && (
                  <Badge className="absolute top-2 right-2">Featured</Badge>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.techStack?.slice(0, 3).map((tech, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.techStack && project.techStack.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.techStack.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProject(project);
                      setIsDialogOpen(true);
                    }}
                    data-testid={`button-edit-project-${project.id}`}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.title}"?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No projects added yet. Click "Add Project" to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BlogView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const postSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional(),
    published: z.boolean().default(true),
  });

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      published: true,
    },
  });

  useEffect(() => {
    if (editingPost) {
      form.reset({
        title: editingPost.title,
        content: editingPost.content,
        excerpt: editingPost.excerpt || "",
        published: editingPost.published ?? true,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        excerpt: "",
        published: true,
      });
    }
  }, [editingPost, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      return apiRequest("POST", "/api/blog", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Success", description: "Blog post added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add blog post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      return apiRequest("PUT", `/api/blog/${editingPost?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Success", description: "Blog post updated successfully" });
      setIsDialogOpen(false);
      setEditingPost(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/blog/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    if (editingPost) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground">
          Manage your blog posts
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingPost(null)}
              data-testid="button-add-blog"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Blog Post" : "Add New Blog Post"}
              </DialogTitle>
              <DialogDescription>
                {editingPost
                  ? "Update the blog post"
                  : "Write a new blog post to share your knowledge"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Blog post title"
                          {...field}
                          data-testid="input-blog-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Short preview text"
                          {...field}
                          data-testid="input-blog-excerpt"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your blog post..."
                          className="min-h-48 resize-none"
                          {...field}
                          data-testid="input-blog-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-blog-published"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Published</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-blog"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingPost
                        ? "Update"
                        : "Publish Post"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} data-testid={`card-admin-blog-${post.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Not published"}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt || post.content.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-blog-${post.id}`}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-blog-${post.id}`}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No blog posts yet. Click "Add Post" to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SocialLinksView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: links, isLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const linkSchema = z.object({
    platform: z.string().min(1, "Platform is required"),
    url: z.string().min(1, "URL is required"),
    icon: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      platform: "",
      url: "",
      icon: "",
    },
  });

  useEffect(() => {
    if (editingLink) {
      form.reset({
        platform: editingLink.platform,
        url: editingLink.url,
        icon: editingLink.icon || "",
      });
    } else {
      form.reset({ platform: "", url: "", icon: "" });
    }
  }, [editingLink, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof linkSchema>) => {
      return apiRequest("POST", "/api/social-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "Success", description: "Social link added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add social link",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof linkSchema>) => {
      return apiRequest("PUT", `/api/social-links/${editingLink?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "Success", description: "Social link updated successfully" });
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update social link",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/social-links/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "Success", description: "Social link deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete social link",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof linkSchema>) => {
    if (editingLink) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const platforms = ["GitHub", "LinkedIn", "Email", "Twitter", "Website"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground">
          Manage your social media and contact links
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingLink(null)}
              data-testid="button-add-social"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLink ? "Edit Social Link" : "Add New Social Link"}
              </DialogTitle>
              <DialogDescription>
                {editingLink
                  ? "Update the social link"
                  : "Add a new social media or contact link"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-social-platform">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL / Value</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            form.watch("platform") === "Email"
                              ? "your@email.com"
                              : "https://..."
                          }
                          {...field}
                          data-testid="input-social-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-social"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingLink
                        ? "Update"
                        : "Add Link"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links && links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <Card key={link.id} data-testid={`card-social-${link.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{link.platform}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {link.url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingLink(link);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-social-${link.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-social-${link.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Social Link</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {link.platform} link?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(link.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No social links added yet. Click "Add Link" to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MessagesView({ token }: { token: string | null }) {
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/messages"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/read`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Success", description: "Message deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Messages from visitors who contacted you through the portfolio
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={!message.read ? "border-primary/50" : ""}
              data-testid={`card-message-${message.id}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{message.name}</span>
                      </div>
                      {!message.read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Mail className="h-3 w-3" />
                      <a
                        href={`mailto:${message.email}`}
                        className="hover:underline"
                      >
                        {message.email}
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <Calendar className="h-3 w-3" />
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleString()
                        : "Unknown date"}
                    </p>
                    <p className="text-sm bg-muted/50 p-3 rounded-md">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!message.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReadMutation.mutate(message.id)}
                        data-testid={`button-mark-read-${message.id}`}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Mark Read
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-message-${message.id}`}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Message</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this message from{" "}
                            {message.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(message.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No messages yet. Messages from your contact form will appear here.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResumeView({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: ["/api/resume"],
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      toast({ title: "Success", description: "Resume uploaded successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/resume", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      toast({ title: "Success", description: "Resume deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Upload and manage your resume PDF
      </p>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : resume ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-md bg-primary/10">
                    <FileDown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{resume.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded{" "}
                      {resume.uploadedAt
                        ? new Date(resume.uploadedAt).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/api/resume/download" download>
                    <Button variant="outline" data-testid="button-download-resume-admin">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        data-testid="button-delete-resume"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your resume? Visitors
                          won't be able to download it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="replace-resume">Replace Resume</Label>
                <div className="mt-2">
                  <label
                    htmlFor="replace-resume"
                    className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {uploading ? "Uploading..." : "Click to upload new PDF"}
                    </span>
                  </label>
                  <input
                    id="replace-resume"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                    data-testid="input-upload-resume"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="upload-resume">Upload Resume</Label>
              <div className="mt-2">
                <label
                  htmlFor="upload-resume"
                  className="flex flex-col items-center justify-center gap-2 p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload PDF resume"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF files only
                  </span>
                </label>
                <input
                  id="upload-resume"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                  data-testid="input-upload-resume"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
