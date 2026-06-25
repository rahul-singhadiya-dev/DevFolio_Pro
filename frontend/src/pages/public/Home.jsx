// src/pages/public/Home.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Briefcase, Award, FolderHeart, Code, ChevronRight, AlertCircle, Server, Database, Cpu, Terminal } from 'lucide-react';
import client from '../../api/client';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ProjectCard from '../../components/projects/ProjectCard';
import { formatDate, formatDuration } from '../../utils/formatDate';
import { resolveAssetUrl } from '../../utils/assets';

const getCategoryIcon = (category) => {
  const cat = category.toUpperCase();
  if (cat.includes('FRONT') || cat.includes('DESIGN') || cat.includes('UI') || cat.includes('CLIENT')) {
    return <Code size={14} />;
  }
  if (cat.includes('BACK') || cat.includes('API') || cat.includes('SERVER')) {
    return <Server size={14} />;
  }
  if (cat.includes('DATA') || cat.includes('DB') || cat.includes('SQL')) {
    return <Database size={14} />;
  }
  if (cat.includes('DEV') || cat.includes('OPS') || cat.includes('CLOUD') || cat.includes('INFRA')) {
    return <Cpu size={14} />;
  }
  return <Terminal size={14} />;
};

// Custom hook to render typewriter animations
const useTypewriter = (words, speed = 80, delay = 2000) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    
    let timer;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, speed);
    }

    if (!isDeleting && text === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, speed, delay]);

  return text;
};

export const Home = () => {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback defaults for new setup
  const defaultProfile = {
    fullName: "Alex Carter",
    title: "Full-Stack Developer",
    bio: "I'm a full-stack developer with 5+ years building production-grade web apps. I specialize in React, Node.js, and cloud-native architecture. I care about clean code, great UX, and shipping things that matter.",
    avatarUrl: null,
    resumeUrl: null
  };

  const defaultSkills = [
    { id: '1', name: 'React', category: 'FRONTEND', proficiency: 'EXPERT' },
    { id: '2', name: 'JavaScript', category: 'FRONTEND', proficiency: 'EXPERT' },
    { id: '3', name: 'Node.js', category: 'BACKEND', proficiency: 'EXPERT' },
    { id: '4', name: 'Express', category: 'BACKEND', proficiency: 'ADVANCED' },
    { id: '5', name: 'PostgreSQL', category: 'DATABASE', proficiency: 'ADVANCED' },
    { id: '6', name: 'Docker', category: 'DEVOPS', proficiency: 'INTERMEDIATE' },
  ];

  const defaultExperiences = [
    {
      id: '1',
      company: 'TechCorp Solutions',
      role: 'Senior Full-Stack Engineer',
      startDate: '2022-06-01',
      endDate: null,
      isCurrent: true,
      description: 'Lead developer for high-traffic SaaS operations.\nArchitected serverless pipelines reducing load times by 40%.\nMentored junior developers and introduced testing standardizations.'
    }
  ];

  const defaultProjects = [
    {
      id: '1',
      title: 'DevFolio Pro CMS',
      slug: 'devfolio-pro',
      shortDescription: 'Self-hosted modular developer portfolio platform with JWT dashboard.',
      techTags: ['React', 'Node.js', 'Prisma', 'PostgreSQL'],
      thumbnailUrl: null
    },
    {
      id: '2',
      title: 'Taskify Kanban',
      slug: 'taskify-kanban',
      shortDescription: 'Collaborative team project management board with real-time drag-and-drop updates.',
      techTags: ['React', 'Node.js', 'Socket.io', 'Redis'],
      thumbnailUrl: null
    },
    {
      id: '3',
      title: 'Algorithmic Trading Bot',
      slug: 'algo-trading-bot',
      shortDescription: 'Automated crypto trading agent using market sentiment and EMA crossovers.',
      techTags: ['Node.js', 'PostgreSQL', 'Docker', 'REST API'],
      thumbnailUrl: null
    },
    {
      id: '4',
      title: 'Apex E-Commerce',
      slug: 'apex-ecommerce',
      shortDescription: 'Modern microservices-based online retail platform with Stripe integrations.',
      techTags: ['Next.js', 'Node.js', 'Stripe', 'MongoDB'],
      thumbnailUrl: null
    }
  ];

  const typewriterWords = useMemo(() => [
    profile?.title || defaultProfile.title,
    "Crafting fast, scalable web systems.",
    "Designing stunning user interfaces.",
    "Shipping production-ready products."
  ], [profile?.title]);

  const typewriterSubtitle = useTypewriter(typewriterWords);

  useEffect(() => {
    let active = true;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch all landing data concurrently
        const [profileRes, skillsRes, projectsRes, expRes] = await Promise.allSettled([
          client.get('/profile'),
          client.get('/skills'),
          client.get('/projects?limit=4'),
          client.get('/experience')
        ]);

        if (!active) return;

        if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
          setProfile(profileRes.value.data.data);
        }
        if (skillsRes.status === 'fulfilled' && skillsRes.value.data.success) {
          setSkills(skillsRes.value.data.data);
        }
        if (projectsRes.status === 'fulfilled' && projectsRes.value.data.success) {
          const fetchedProjects = projectsRes.value.data.data?.projects || [];
          setProjects(fetchedProjects);
        }
        if (expRes.status === 'fulfilled' && expRes.value.data.success) {
          setExperiences(expRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to fetch home page sections.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      active = false;
    };
  }, []);

  // Group skills by category if they are not already grouped
  let groupedSkills = {};
  if (skills && !Array.isArray(skills) && Object.keys(skills).length > 0) {
    groupedSkills = skills;
  } else {
    const skillsList = Array.isArray(skills) && skills.length > 0 ? skills : defaultSkills;
    groupedSkills = skillsList.reduce((acc, skill) => {
      const cat = skill.category || 'FRONTEND';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }

  const displayedProfile = profile || defaultProfile;
  const displayedExperiences = experiences.length > 0 ? experiences : defaultExperiences;
  const displayedProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* 1. Hero Section */}
      <section id="hero" className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden" aria-label="Introduction">
        <div className="spotlight-backdrop" />
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold font-mono text-foreground shadow-sm mb-6 uppercase">
          <span className="pingDotContainer">
            <span className="pingDotAnimate" />
            <span className="pingDotStatic" />
          </span>
          Available for projects
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-none tracking-tight text-foreground">
          Hi, I'm <span className="font-bold text-foreground">{displayedProfile.fullName}</span>.
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6" aria-live="polite">
          {typewriterSubtitle || '\u00a0'}
          <span className="animate-pulse font-bold text-primary">|</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px] sm:max-w-none justify-center items-center mb-12">
          <Button variant="primary" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
            View My Work <ArrowRight size={16} />
          </Button>
          <Link to="/resume">
            <Button variant="outline">
              View Resume <Download size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. About Section */}
      <section id="about" className="py-20 border-b border-border scroll-mt-16 text-left" aria-label="About Me">
        <div className="mb-10">
          <span className="section-label">01 — Who I Am</span>
          <h2 className="text-2xl font-semibold text-foreground mt-1">About Me</h2>
        </div>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-[1fr_2.5fr] items-start">
          <div className="flex justify-center">
            {displayedProfile.avatarUrl ? (
              <img src={resolveAssetUrl(displayedProfile.avatarUrl)} alt={displayedProfile.fullName} className="w-[120px] h-[120px] rounded-full object-cover border border-border bg-card" loading="lazy" />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center bg-card border border-border">
                <Code size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
            <p>{displayedProfile.bio}</p>
          </div>
        </div>
      </section>

      {/* 3. Skills Section */}
      <section id="skills" className="py-20 border-b border-border scroll-mt-16 text-left" aria-label="Skills">
        <div className="mb-10">
          <span className="section-label">02 — Technical Arsenal</span>
          <h2 className="text-2xl font-semibold text-foreground mt-1">What I Work With</h2>
        </div>
        <ErrorBoundary>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              ['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS'].map((cat) => (
                <div key={cat} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                  <div className="w-[120px] h-5 bg-border rounded-sm mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <div className="w-[75px] h-6 bg-border rounded-sm" />
                    <div className="w-[75px] h-6 bg-border rounded-sm" />
                    <div className="w-[75px] h-6 bg-border rounded-sm" />
                  </div>
                </div>
              ))
            ) : (
              Object.entries(groupedSkills).map(([category, items]) => (
                <div key={category} className="bg-card/30 backdrop-blur-xs border border-border rounded-lg p-6 transition-colors duration-150 hover:border-muted-foreground/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-sm border border-border bg-background flex items-center justify-center text-foreground shadow-sm">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-sm font-semibold capitalize">
                      {category.replace('_', ' ').toLowerCase()}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <div key={skill.id} className="inline-flex items-center gap-2 px-2 py-1 bg-card border border-border rounded-sm text-[11px] font-mono transition-colors hover:border-muted-foreground/30">
                        <span className="text-foreground font-medium">{skill.name}</span>
                        <span className="text-[9px] text-muted-foreground/80 border-l border-border pl-2 uppercase">{skill.proficiency.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ErrorBoundary>
      </section>

      {/* 4. Experience Section */}
      <section id="experience" className="py-20 border-b border-border scroll-mt-16 text-left" aria-label="Work Experience">
        <div className="mb-10">
          <span className="section-label">03 — Experience</span>
          <h2 className="text-2xl font-semibold text-foreground mt-1">Where I've Been</h2>
        </div>
        <ErrorBoundary>
          <div className="flex flex-col gap-8 max-w-[800px] relative pl-6 border-l border-border">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="relative pl-8 mb-8 animate-pulse">
                  <div className="absolute left-[-28.5px] top-1.5 w-2 h-2 rounded-full bg-border border border-background" />
                  <div className="flex flex-col sm:flex-row justify-between mb-2">
                    <div className="flex-grow">
                      <div className="w-[150px] h-5 bg-border rounded-sm mb-2" />
                      <div className="w-[100px] h-4 bg-border rounded-sm" />
                    </div>
                    <div className="w-[80px] h-4 bg-border rounded-sm" />
                  </div>
                  <div className="w-[90%] h-4 bg-border rounded-sm mt-4 mb-2" />
                  <div className="w-[60%] h-4 bg-border rounded-sm" />
                </div>
              ))
            ) : (
              displayedExperiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  <div className="absolute left-[-28.5px] top-1.5 w-2 h-2 rounded-full bg-border border border-background transition-colors duration-150 group-hover:bg-foreground" />
                  <div className="flex flex-col sm:flex-row justify-between gap-1 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{exp.role}</h3>
                      <span className="text-muted-foreground font-medium text-sm">{exp.company}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">{exp.description}</p>
                </div>
              ))
            )}
          </div>
        </ErrorBoundary>
      </section>

      {/* 5. Projects Teaser Section */}
      <section id="projects" className="py-20 border-b border-border scroll-mt-16 text-left" aria-label="Featured Projects">
        <div className="mb-10">
          <span className="section-label">04 — Selected Projects</span>
          <h2 className="text-2xl font-semibold text-foreground mt-1">Latest Works</h2>
        </div>
        <ErrorBoundary>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 h-full flex flex-col animate-pulse">
                  <div className="aspect-[16/10] bg-border rounded-md mb-4" />
                  <div className="flex flex-col flex-grow">
                    <div className="w-[60%] h-5 bg-border rounded-sm mb-2" />
                    <div className="w-[90%] h-4 bg-border rounded-sm mb-2" />
                    <div className="w-[80%] h-4 bg-border rounded-sm mb-4" />
                    <div className="flex gap-2 mt-auto">
                      <div className="w-[50px] h-5 bg-border rounded-sm" />
                      <div className="w-[65px] h-5 bg-border rounded-sm" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              displayedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
          <div className="mt-10 flex justify-center w-full">
            <Link to="/projects">
              <Button variant="outline">
                Browse All Projects <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </ErrorBoundary>
      </section>

      {/* 6. Contact Teaser Section */}
      <section id="contact" className="py-20 scroll-mt-16 text-left" aria-label="Call to Action">
        <div className="mb-6 text-center">
          <span className="section-label">05 — Get In Touch</span>
        </div>
        <div className="rounded-lg py-12 px-6 text-center max-w-[800px] mx-auto border border-border bg-card/30 backdrop-blur-xs relative overflow-hidden">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Have a project in mind?</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-[450px] mx-auto">
            Let's collaborate to build something performant and beautiful.
          </p>
          <Link to="/contact">
            <Button variant="secondary">
              Get In Touch <MailIcon />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Simple embedded Icon
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export default Home;
