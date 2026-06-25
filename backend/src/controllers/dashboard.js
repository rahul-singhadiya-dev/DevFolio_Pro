const prisma = require('../prisma/prisma');

/**
 * Fetch Aggregated Statistics for the Admin Dashboard (Protected)
 */
exports.getStats = async (req, res, next) => {
  try {
    // 1. Total projects count
    const totalProjects = await prisma.project.count();

    // 2. Total published blog posts
    const totalBlogPosts = await prisma.blogPost.count({
      where: { published: true },
    });

    // 3. Contact messages: total and unread
    const totalMessages = await prisma.contactMessage.count();
    const unreadMessages = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    // 4. Sum of all project views
    const viewStats = await prisma.project.aggregate({
      _sum: {
        viewCount: true,
      },
    });
    const totalProjectViews = viewStats._sum.viewCount || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalBlogPosts,
        totalMessages,
        unreadMessages,
        totalProjectViews,
      },
    });
  } catch (error) {
    next(error);
  }
};
