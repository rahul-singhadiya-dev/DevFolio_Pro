require('dotenv').config();
const prisma = require('../src/prisma/prisma');

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clean existing records (Optional, but ensures fresh start)
    console.log('🧹 Cleaning existing data...');
    await prisma.contactMessage.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.experience.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.profile.deleteMany({});
    console.log('✅ Clean complete.');

    // 2. Seed Developer Profile
    console.log('👤 Seeding Profile...');
    const profile = await prisma.profile.create({
      data: {
        fullName: 'Alex Carter',
        title: 'Senior Full-Stack Developer',
        bio: "I'm a full-stack developer with 5+ years building production-grade web apps. I specialize in React, Node.js, and cloud-native architecture. I care about clean code, great UX, and shipping things that matter.",
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
        githubUrl: 'https://github.com/alexcarter',
        linkedinUrl: 'https://linkedin.com/in/alexcarter',
        twitterUrl: 'https://twitter.com/alexcarter',
        resumeUrl: null, // Starts as null, uploaded via dashboard later
      },
    });
    console.log(`✅ Profile created for: ${profile.fullName}`);

    // 3. Seed Skills
    console.log('⚡ Seeding Skills...');
    const skillsData = [
      { name: 'React.js', category: 'FRONTEND', proficiency: 'EXPERT', sortOrder: 1 },
      { name: 'TypeScript', category: 'FRONTEND', proficiency: 'ADVANCED', sortOrder: 2 },
      { name: 'HTML5 & CSS3', category: 'FRONTEND', proficiency: 'EXPERT', sortOrder: 3 },
      { name: 'TailwindCSS', category: 'FRONTEND', proficiency: 'ADVANCED', sortOrder: 4 },
      
      { name: 'Node.js & Express', category: 'BACKEND', proficiency: 'EXPERT', sortOrder: 1 },
      { name: 'GraphQL API', category: 'BACKEND', proficiency: 'INTERMEDIATE', sortOrder: 2 },
      { name: 'NestJS', category: 'BACKEND', proficiency: 'INTERMEDIATE', sortOrder: 3 },
      
      { name: 'PostgreSQL (Neon)', category: 'DATABASE', proficiency: 'ADVANCED', sortOrder: 1 },
      { name: 'MongoDB', category: 'DATABASE', proficiency: 'ADVANCED', sortOrder: 2 },
      { name: 'Redis Cache', category: 'DATABASE', proficiency: 'INTERMEDIATE', sortOrder: 3 },
      
      { name: 'Docker', category: 'DEVOPS', proficiency: 'ADVANCED', sortOrder: 1 },
      { name: 'AWS (S3/EC2)', category: 'DEVOPS', proficiency: 'INTERMEDIATE', sortOrder: 2 },
      { name: 'GitHub Actions CI/CD', category: 'DEVOPS', proficiency: 'ADVANCED', sortOrder: 3 },
      
      { name: 'Git & GitHub', category: 'TOOLS', proficiency: 'EXPERT', sortOrder: 1 },
      { name: 'Postman', category: 'TOOLS', proficiency: 'EXPERT', sortOrder: 2 },
      { name: 'Figma', category: 'TOOLS', proficiency: 'INTERMEDIATE', sortOrder: 3 }
    ];

    for (const skill of skillsData) {
      await prisma.skill.create({ data: skill });
    }
    console.log(`✅ Seeded ${skillsData.length} skills.`);

    // 4. Seed Projects
    console.log('📂 Seeding Projects...');
    const projectsData = [
      {
        title: 'DevFolio Pro',
        slug: 'devfolio-pro',
        shortDescription: 'Self-managed developer portfolio CMS built with React, Node.js, and Prisma.',
        fullDescription: `# DevFolio Pro\n\nA complete CMS-style portfolio platform where developers own their data and control their brand.\n\n### Key Features\n- **Dynamic grids**: Sort and filter projects dynamically by tech stack tags.\n- **Blogging engine**: Write posts in markdown with inline syntax highlighting.\n- **JWT admin panel**: Manage profile details, skills, experiences, and messages in a protected portal.\n- **Cloud uploader**: Resume uploads directly handle buffer writes using Cloudinary.`,
        techTags: ['React', 'Node.js', 'Prisma', 'PostgreSQL'],
        liveUrl: 'https://devfolio-pro.example.com',
        githubUrl: 'https://github.com/alexcarter/devfolio-pro',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600',
        viewCount: 156,
        published: true,
      },
      {
        title: 'Taskify Kanban',
        slug: 'taskify-kanban',
        shortDescription: 'Collaborative team project management board with real-time drag-and-drop updates.',
        fullDescription: `# Taskify Kanban\n\nReplicating advanced workspace dashboards like Trello, featuring real-time socket connections.\n\n### Technologies Used\n- **Socket.io** for real-time card synchronization across multi-user sessions.\n- **React DnD** for interactive board interactions.\n- **Redis** as a caching queue to maintain database writes stability.`,
        techTags: ['React', 'Node.js', 'Socket.io', 'Redis'],
        liveUrl: 'https://taskify-kanban.example.com',
        githubUrl: 'https://github.com/alexcarter/taskify-kanban',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?auto=format&fit=crop&q=80&w=600',
        viewCount: 84,
        published: true,
      },
      {
        title: 'Algorithmic Trading Bot',
        slug: 'algo-trading-bot',
        shortDescription: 'Automated crypto trading agent using market sentiment and EMA crossovers.',
        fullDescription: `# Algorithmic Trading Bot\n\nAn automated client trading bot implementing Technical Analysis crossover calculations.\n\n> WARNING: Mock simulation trading only. Do not trade real capital without backtesting.\n\n### Characteristics\n- Backtested against 3 years of Binance spot market histories.\n- Integrated with Twitter developer API for real-time crypto sentiment indexes.`,
        techTags: ['Node.js', 'PostgreSQL', 'Docker', 'REST API'],
        liveUrl: null,
        githubUrl: 'https://github.com/alexcarter/trading-bot',
        thumbnailUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=600',
        viewCount: 204,
        published: true,
      }
    ];

    for (const project of projectsData) {
      await prisma.project.create({ data: project });
    }
    console.log(`✅ Seeded ${projectsData.length} projects.`);

    // 5. Seed Experience entries
    console.log('💼 Seeding Experiences...');
    const experiencesData = [
      {
        company: 'TechCorp Industries',
        role: 'Senior Software Engineer',
        startDate: new Date('2023-01-15'),
        endDate: null,
        isCurrent: true,
        description: '- Architected and shipped 4 client dashboard interfaces using React, Redux, and Node.js.\n- Mentored 5 junior engineers and executed technical review processes.\n- Boosted client asset load performance by 40% implementing image optimization and asset CDNs.'
      },
      {
        company: 'WebFlow Studios',
        role: 'Full-Stack Developer',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2022-12-31'),
        isCurrent: false,
        description: '- Developed bespoke e-commerce workflows and CMS modules for international brands.\n- Maintained database query structures, increasing PostgreSQL server responsiveness under load.\n- Set up automated Docker environments reducing local workstation sync setups from days to minutes.'
      }
    ];

    for (const exp of experiencesData) {
      await prisma.experience.create({ data: exp });
    }
    console.log(`✅ Seeded ${experiencesData.length} experience entries.`);

    // 6. Seed Blog Posts
    console.log('✍️ Seeding Blog Posts...');
    const blogsData = [
      {
        title: 'Mastering Node.js Stream Pipes',
        slug: 'mastering-node-stream-pipes',
        excerpt: 'An in-depth guide on handling file stream pipes in Node.js backend controllers to reduce memory footprints.',
        content: "Streams are one of the most powerful and misunderstood features of Node.js. If you are reading large files into memory or downloading buffers over network requests, you might be causing memory spikes.\n\n### The Problem with fs.readFile\n\nWhen you use `fs.readFile()`, Node loads the entire file buffer into RAM. For a 2GB file, that's 2GB of memory allocated directly. If 10 visitors hit that route concurrently, your server will likely crash with an Out of Memory error.\n\n### The Stream Solution\n\nBy piping readable file streams into write streams, we process files chunk-by-chunk (typically 64KB buffers) without holding the full content in memory:\n\n```javascript\nconst fs = require('fs');\nconst { pipeline } = require('stream/promises');\n\nasync function run() {\n  await pipeline(\n    fs.createReadStream('large-file.zip'),\n    fs.createWriteStream('destination.zip')\n  );\n  console.log('Piped successfully!');\n}\n```",
        tags: ['Node.js', 'Streams', 'Backend'],
        published: true,
      },
      {
        title: 'Why We Switched to Neon PostgreSQL',
        slug: 'why-we-switched-to-neon-postgresql',
        excerpt: 'Exploring serverless connection limits, auto-scaling compute, and database branches in Neon.',
        content: "Neon is a serverless, open-source alternative to standard self-hosted databases. We recently migrated our core CMS platforms to it and here are our primary takeaways:\n\n### 1. Connection Pooling Out-of-the-box\nIn a serverless world (Vercel, AWS Lambda), connection management is painful. Lambdas spin up and down, hitting Postgres connection limits. Neon provides built-in pgpooler endpoints allowing thousands of concurrent links.\n\n### 2. Database Branching\nSimilar to Git branches, Neon lets you branch your database schema and data in seconds. You can create a staging database branch from main instantly, run your test suites, and destroy it without affecting production logs.",
        tags: ['PostgreSQL', 'Neon', 'Database'],
        published: true,
      }
    ];

    for (const post of blogsData) {
      await prisma.blogPost.create({ data: post });
    }
    console.log(`✅ Seeded ${blogsData.length} blog posts.`);

    // 7. Seed Contact Messages
    console.log('📥 Seeding Messages...');
    await prisma.contactMessage.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        subject: 'Freelance Project Inquiry',
        message: 'Hello Alex, I came across your portfolio website and love your Kanban Board project. We are looking for a freelance full-stack developer to help build a custom customer portal. Are you available for a quick chat next week?',
        isRead: false,
      },
    });
    console.log('✅ Seeded message inbox.');

    console.log('🌿 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
