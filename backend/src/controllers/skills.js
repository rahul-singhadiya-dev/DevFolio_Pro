const prisma = require('../prisma/prisma');
const cache = require('../utils/cache');

/**
 * Get All Skills Grouped by Category (Public)
 * Ordered by sortOrder asc.
 */
exports.getSkills = async (req, res, next) => {
  try {
    const cachedSkills = cache.get('skills');
    if (cachedSkills) {
      return res.status(200).json({
        success: true,
        data: cachedSkills,
      });
    }

    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group skills by category structure
    const groupedSkills = {
      FRONTEND: [],
      BACKEND: [],
      DATABASE: [],
      DEVOPS: [],
      TOOLS: [],
    };

    skills.forEach((skill) => {
      if (groupedSkills[skill.category]) {
        groupedSkills[skill.category].push(skill);
      } else {
        groupedSkills[skill.category] = [skill];
      }
    });

    cache.set('skills', groupedSkills);

    return res.status(200).json({
      success: true,
      data: groupedSkills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List All Skills (Admin - Protected)
 * Returns flat list.
 */
exports.getAdminSkills = async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    return res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a Skill (Admin - Protected)
 */
exports.createSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, sortOrder } = req.body;

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        proficiency,
        sortOrder: parseInt(sortOrder || '0', 10),
      },
    });

    cache.invalidate('skills');

    return res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Skill (Admin - Protected)
 */
exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, proficiency, sortOrder } = req.body;

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      return res.status(404).json({
        error: true,
        message: 'Skill not found.',
      });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name,
        category,
        proficiency,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
      },
    });

    cache.invalidate('skills');

    return res.status(200).json({
      success: true,
      data: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Skill (Admin - Protected)
 */
exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      return res.status(404).json({
        error: true,
        message: 'Skill not found.',
      });
    }

    await prisma.skill.delete({
      where: { id },
    });

    cache.invalidate('skills');

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
