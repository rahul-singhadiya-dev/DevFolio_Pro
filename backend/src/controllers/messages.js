const prisma = require('../prisma/prisma');
const { sendContactNotification } = require('../utils/mailer');

/**
 * Submit Contact Form Message (Public)
 * Returns 201 even if mail send fails.
 */
exports.submitMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to Database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        isRead: false,
      },
    });

    // 2. Dispatch email notification asynchronously
    // We do not await this block so that mail latency or SMTP network errors
    // do not block or fail the visitor's API response.
    sendContactNotification({ name, email, subject, message })
      .then((info) => {
        if (info) {
          console.log(`[Mailer] Contact email notification sent: ${info.messageId}`);
        }
      })
      .catch((error) => {
        console.error('[Mailer] Contact email notification failed:', error);
      });

    // 3. Return 201 success response envelope
    return res.status(201).json({
      success: true,
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List All Contact Messages (Admin - Protected)
 * Sorted by newest first.
 */
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Message as Read (Admin - Protected)
 */
exports.markMessageRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return res.status(404).json({
        error: true,
        message: 'Message not found.',
      });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? (isRead === true || isRead === 'true') : true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Message (Admin - Protected)
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return res.status(404).json({
        error: true,
        message: 'Message not found.',
      });
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
