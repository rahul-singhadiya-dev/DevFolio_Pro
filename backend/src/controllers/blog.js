const prisma = require('../prisma/prisma');
const slugify = require('../utils/slugify');

/**
 * Get Published Blog Posts (Public)
 * Supports pagination (?page=1&limit=10), topic tag filter (?tag=CSS), and search (?search=Express)
 */
exports.getBlogPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const tag = req.query.tag;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query conditions
    const where = {
      published: true,
    };

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Run parallel count and find queries
    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        posts,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Blog Post by Slug (Public)
 */
exports.getBlogPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return res.status(404).json({
        error: true,
        message: 'Blog post not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List All Blog Posts (Admin - Protected)
 * Fetch both published and draft articles.
 */
exports.getAdminBlogPosts = async (req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Blog Post (Admin - Protected)
 */
exports.createBlogPost = async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, tags, published } = req.body;

    // Process unique slug
    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) {
      finalSlug = 'untitled-post';
    }

    // Verify slug uniqueness, auto-resolving collisions
    let existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
    let counter = 1;
    const baseSlug = finalSlug;
    while (existing) {
      finalSlug = `${baseSlug}-${counter}`;
      existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || '',
        content,
        tags: Array.isArray(tags) ? tags : [],
        published: published === true || published === 'true',
      },
    });

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Blog Post (Admin - Protected)
 */
exports.updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, tags, published } = req.body;

    // Check if post exists
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({
        error: true,
        message: 'Blog post not found.',
      });
    }

    // Build update object
    const updateData = {
      title,
      excerpt: excerpt || '',
      content,
      tags: Array.isArray(tags) ? tags : [],
      published: published === true || published === 'true',
    };

    // Process slug if modified
    if (slug && slug !== post.slug) {
      let finalSlug = slugify(slug);
      
      // Ensure the new slug is unique (exclude current post ID)
      const existing = await prisma.blogPost.findFirst({
        where: {
          slug: finalSlug,
          id: { not: id },
        },
      });

      if (existing) {
        // Resolve slug collision
        let counter = 1;
        const baseSlug = finalSlug;
        let uniqueSlug = `${baseSlug}-${counter}`;
        let innerExisting = await prisma.blogPost.findFirst({
          where: {
            slug: uniqueSlug,
            id: { not: id },
          },
        });
        while (innerExisting) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
          innerExisting = await prisma.blogPost.findFirst({
            where: {
              slug: uniqueSlug,
              id: { not: id },
            },
          });
        }
        finalSlug = uniqueSlug;
      }
      
      updateData.slug = finalSlug;
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Blog Post (Admin - Protected)
 */
exports.deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({
        error: true,
        message: 'Blog post not found.',
      });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
