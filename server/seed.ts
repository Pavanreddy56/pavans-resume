import { db } from "./db";
import { heroSection, skills, socialLinks, projects, blogPosts } from "@shared/schema";
import bcrypt from "bcrypt";
import { admins } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingAdmin = await db.select().from(admins);
  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(admins).values({
      username: "admin",
      password: hashedPassword,
    });
    console.log("Created admin user");
  }

  const existingHero = await db.select().from(heroSection);
  if (existingHero.length === 0) {
    await db.insert(heroSection).values({
      name: "Pavan Reddy Cheedeti",
      title: "DevOps Engineer",
      intro:
        "Cloud enthusiast with 2+ years of experience in IT industry as a DevOps/Cloud Engineer. Proven experience in AWS, CI/CD, Docker, Kubernetes, Terraform, and Ansible. Passionate about automating infrastructure and streamlining deployment processes for optimal efficiency.",
      profileImage: null,
    });
    console.log("Created hero section");
  }

  const existingSocialLinks = await db.select().from(socialLinks);
  if (existingSocialLinks.length === 0) {
    await db.insert(socialLinks).values([
      { platform: "GitHub", url: "https://github.com/Pavanreddy56" },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/pavan-reddy-cheedeti-918237281",
      },
      { platform: "Email", url: "cpreddy.devops@gmail.com" },
    ]);
    console.log("Created social links");
  }

  const existingSkills = await db.select().from(skills);
  if (existingSkills.length === 0) {
    await db.insert(skills).values([
      { name: "AWS", category: "Cloud Platforms" },
      { name: "Microsoft Azure", category: "Cloud Platforms" },
      { name: "EC2", category: "Cloud Platforms" },
      { name: "VPC", category: "Cloud Platforms" },
      { name: "S3", category: "Cloud Platforms" },
      { name: "IAM", category: "Cloud Platforms" },
      { name: "EKS", category: "Cloud Platforms" },
      { name: "CloudFormation", category: "Cloud Platforms" },
      { name: "Docker", category: "Containerization" },
      { name: "Kubernetes", category: "Containerization" },
      { name: "Helm Charts", category: "Containerization" },
      { name: "Amazon ECS", category: "Containerization" },
      { name: "Jenkins", category: "CI/CD" },
      { name: "Maven", category: "CI/CD" },
      { name: "Git", category: "CI/CD" },
      { name: "GitHub", category: "CI/CD" },
      { name: "SonarQube", category: "CI/CD" },
      { name: "Nexus", category: "CI/CD" },
      { name: "Terraform", category: "Infrastructure" },
      { name: "Ansible", category: "Infrastructure" },
      { name: "CloudWatch", category: "Infrastructure" },
      { name: "Prometheus", category: "Infrastructure" },
      { name: "Grafana", category: "Infrastructure" },
      { name: "Python", category: "Programming" },
      { name: "Shell Scripting", category: "Programming" },
      { name: "Groovy", category: "Programming" },
      { name: "MySQL", category: "Databases" },
      { name: "PostgreSQL", category: "Databases" },
      { name: "MongoDB", category: "Databases" },
      { name: "Oracle", category: "Databases" },
    ]);
    console.log("Created skills");
  }

  const existingProjects = await db.select().from(projects);
  if (existingProjects.length === 0) {
    await db.insert(projects).values([
      {
        title: "AWS Infrastructure Automation",
        description:
          "Designed and deployed AWS infrastructure (EC2, VPC, RDS, S3, IAM, ELB, Auto Scaling) using CloudFormation templates (YAML/JSON). Implemented infrastructure as code for consistent, repeatable deployments across multiple environments.",
        techStack: ["AWS", "CloudFormation", "Terraform", "VPC", "EC2"],
        githubUrl: "https://github.com/Pavanreddy56",
        liveUrl: null,
        featured: true,
      },
      {
        title: "CI/CD Pipeline Implementation",
        description:
          "Implemented comprehensive CI/CD pipelines using Jenkins, Git, Maven, and SonarQube for automated build, test, and deployment. Integrated with Docker and Kubernetes for containerized application delivery.",
        techStack: ["Jenkins", "Git", "Maven", "SonarQube", "Docker"],
        githubUrl: "https://github.com/Pavanreddy56",
        liveUrl: null,
        featured: true,
      },
      {
        title: "Kubernetes Microservices Deployment",
        description:
          "Containerized and deployed microservices using Docker and Kubernetes (EKS, Helm) to ensure scalable application delivery. Configured kubectl to interact with Kubernetes infrastructure.",
        techStack: ["Kubernetes", "Docker", "Helm", "EKS", "Microservices"],
        githubUrl: "https://github.com/Pavanreddy56",
        liveUrl: null,
        featured: true,
      },
    ]);
    console.log("Created projects");
  }

  const existingBlogPosts = await db.select().from(blogPosts);
  if (existingBlogPosts.length === 0) {
    await db.insert(blogPosts).values([
      {
        title: "Getting Started with Kubernetes on AWS EKS",
        content:
          "Kubernetes has become the de facto standard for container orchestration. In this post, I'll walk you through setting up a production-ready Kubernetes cluster on AWS using EKS. We'll cover creating the cluster, configuring kubectl, deploying applications, and setting up monitoring with CloudWatch.",
        excerpt:
          "A comprehensive guide to deploying and managing Kubernetes clusters on AWS EKS with best practices.",
        published: true,
      },
      {
        title: "Automating Infrastructure with Terraform",
        content:
          "Infrastructure as Code (IaC) is essential for modern DevOps practices. Terraform allows us to define, provision, and manage infrastructure using declarative configuration files. In this article, I share my experience with Terraform modules, state management, and best practices for AWS deployments.",
        excerpt:
          "Learn how to manage your cloud infrastructure efficiently using Terraform and Infrastructure as Code principles.",
        published: true,
      },
      {
        title: "Building Robust CI/CD Pipelines with Jenkins",
        content:
          "Continuous Integration and Continuous Deployment are the backbone of modern software delivery. This post covers how to set up Jenkins pipelines using Groovy, integrate with Docker for containerized builds, and implement automated testing with SonarQube for code quality checks.",
        excerpt:
          "Master Jenkins pipelines for automated building, testing, and deploying your applications.",
        published: true,
      },
    ]);
    console.log("Created blog posts");
  }

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  });
