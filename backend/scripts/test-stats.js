require('dotenv').config();
const prisma = require('../src/prisma/prisma');

async function checkDatabaseStats() {
  try {
    const totalProjects = await prisma.project.count();
    const totalBlogPosts = await prisma.blogPost.count({ where: { published: true } });
    const totalMessages = await prisma.contactMessage.count();
    const unreadMessages = await prisma.contactMessage.count({ where: { isRead: false } });
    const viewStats = await prisma.project.aggregate({
      _sum: {
        viewCount: true
      }
    });
    
    console.log('--- Database Raw Metrics ---');
    console.log('Total Projects (DB Count):', totalProjects);
    console.log('Published Blog Posts:     ', totalBlogPosts);
    console.log('Total Messages:           ', totalMessages);
    console.log('Unread Messages:          ', unreadMessages);
    console.log('Sum of Project Views:     ', viewStats._sum.viewCount || 0);
    console.log('----------------------------');

    // List all projects and their individual view counts
    const projects = await prisma.project.findMany({ select: { title: true, viewCount: true } });
    console.log('\nProjects and Views:');
    projects.forEach(p => {
      console.log(`- ${p.title}: ${p.viewCount} views`);
    });
  } catch (error) {
    console.error('Error querying stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStats();
