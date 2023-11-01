import { Request, Response } from 'express';
import { prisma } from '../../../lib/db';
import sharp from 'sharp';
import nodemailer from 'nodemailer';

interface PostsProps {
  categoryId: string;
  id: string;
  category: string;
}

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string)
      : 8;
    const categoryId = req.query.categoryID
      ? req.query.categoryID.toString()
      : undefined;

    const skip = (page - 1) * pageSize;

    const whereCondition: PostsProps | {} = categoryId ? { categoryId } : {};

    const totalPosts = await prisma.post.count({ where: whereCondition });

    const posts = await prisma.post.findMany({
      where: whereCondition,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPages = Math.ceil(totalPosts / pageSize);

    return res.status(200).json({ posts, totalPosts, totalPages });
  } catch (error) {
    console.error('Failed to get posts:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to get posts.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        category: true,
        title: true,
        desc: true,
        base64Img: true,
        updatedAt: true,
        createdAt: true,
        author: {
          select: {
            base64Img: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json([post]);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to create user.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const addPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      desc,
      categoryID: categoryId,
      authorID: authorId,
    } = req.body;

    let image: string = '';

    if (req.file) {
      const buffer = req.file.buffer;

      // Resize and optimize the image
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 950, height: 600 })
        .toFormat('jpeg')
        .toBuffer();

      image = resizedBuffer.toString('base64');
    }

    const user = await prisma.user.findUnique({
      where: {
        email: req.user,
      },
    });

    const newPost = await prisma.post.create({
      data: {
        title,
        desc,
        categoryId,
        authorId,
        base64Img: image,
      },
    });

    const recipients = [
      { email: 'renato@r2619.us', name: 'Renato' },
      { email: 'lais@r2619.us', name: 'Lais' },
      { email: 'lucasff15@hotmail.com', name: 'Lucas' },
    ];

    const transporter = nodemailer.createTransport({
      host: 'mail.r2619.us', // Incoming and outgoing server
      port: 465, // SMTP Port
      secure: true, // Use SSL/TLS
      auth: {
        user: 'server@r2619.us', // Your email address
        pass: 'Vancouver123@',
      },
    });

    // Send personalized emails to each recipient
    for (const recipient of recipients) {
      const mailOptions = {
        from: 'server@r2619.us',
        to: recipient.email,
        subject: 'R2619 New Post',
        text: `Hello ${recipient.name},\n\nA new post has been published by ${
          user?.name
        }.\nTo read it, please follow this link: ${
          'https://r2619.us/posts/' + newPost.id
        }`,
      };

      await new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            console.log('Email sent: ' + info.response);
            resolve();
          }
        });
      });
    }

    return res.json('Post has been added!');
  } catch (error) {
    console.error('Failed to add post:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to add post.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return res.json('Post has been deleted!');
  } catch (error) {
    console.error('Failed to delete post:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to delete post.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const categoryID = req.body.categoryID;
    const authorID = req.body.authorID;

    let image: string = '';

    if (req.file) {
      const buffer = req.file.buffer;

      // Resize and optimize the image
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 950, height: 600 })
        .toFormat('jpeg')
        .toBuffer();

      image = resizedBuffer.toString('base64');
    }

    image = req.body.img ? req.body.img : image;

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title: req.body.title,
        desc: req.body.desc,
        base64Img: image,
        categoryId: categoryID,
        authorId: authorID,
        createdAt: req.body.date,
        updatedAt: req.body.edited,
      },
    });

    return res.json('Post has been updated.');
  } catch (error) {
    console.error('Failed to delete post:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to delete post.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const reportPost = async (req: Request, res: Response) => {
  try {
    const { name: userName, email, message, postId } = req.body;

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    const recipients = [
      // { email: 'renato@r2619.us', name: 'Renato' },
      // { email: 'lais@r2619.us', name: 'Lais' },
      { email: 'lucasff15@hotmail.com', name: 'Lucas' },
    ];

    const transporter = nodemailer.createTransport({
      host: 'mail.r2619.us', // Incoming and outgoing server
      port: 465, // SMTP Port
      secure: true, // Use SSL/TLS
      auth: {
        user: 'server@r2619.us', // Your email address
        pass: 'Vancouver123@',
      },
    });

    // Send personalized emails to each recipient
    for (const recipient of recipients) {
      const mailOptions = {
        from: 'server@r2619.us',
        to: recipient.email,
        subject: 'R2619 Has a Post Report',
        text: `Hello ${recipient.name},
        \n\nA new report for the post "${
          post?.title
        }" has been submitted by user ${userName} (${email}).
        \n
        Report Message:
        ${message}
        \n
        You can review the reported post by following this link: ${
          'https://r2619.us/posts/' + post?.id
        }
        \n
        Regards,
        R2619 Support Team`,
      };

      await new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            console.log('Email sent: ' + info.response);
            resolve();
          }
        });
      });
    }

    return res.json('Report has been made!');
  } catch (error) {
    console.error('Failed to delete post:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to delete post.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
