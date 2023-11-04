import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/db';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

// Generate and store the verification code for the user
const verificationCodes = new Map();

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    // const name = 'Lucas';
    // const email = 'lucas@hotmail.com';
    // const password = 'lukao1000';

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.json({
        errors: [
          {
            msg: 'Email already in use.',
          },
        ],
        data: null,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        base64Img: '',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return res.status(200).json({ user: newUser });
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
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      return res.status(401).json({
        msg: 'Unauthorized',
      });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(401).json({
        msg: 'Unauthorized',
      });
    }

    const token = JWT.sign(
      { name: foundUser.name, email: foundUser.email, role: foundUser.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 36000 }
    );

    res.cookie('token', token);

    res.json({ token: token });
  } catch (error) {
    console.error('Error to login:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to login.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const logOut = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.token) return res.sendStatus(204);
    res.clearCookie('token');
    res.json({ message: 'Cookie cleared' });
  } catch (error) {
    console.error('Error to logout:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to logout.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const currentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user,
      },
    });

    if (user) {
      return res.status(200).json({
        user,
      });
    } else {
      console.error('User not found.');
      return res.status(404).json({
        msg: 'User not found.',
      });
    }
  } catch (error) {
    console.error('Error to get current user:', error);
    return res.status(500).json({
      errors: [{ msg: 'Internal server error.' }],
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let image: string = '';

    if (req.file) {
      const buffer = req.file.buffer;

      // Resize and optimize the image
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 500, height: 500 })
        .toFormat('jpeg')
        .toBuffer();

      image = resizedBuffer.toString('base64');
    }

    await prisma.user.update({
      where: {
        email: req.user,
      },
      data: {
        name,
        email,
        password: hashedPassword,
        base64Img: image,
        role: 'ADMIN',
      },
    });

    return res.json('User has been updated.');
  } catch (error) {
    console.error('Error to get current user:', error);
    return res.status(500).json({
      errors: [{ msg: 'Internal server error.' }],
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const code = crypto.randomBytes(3).toString('hex');

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.send('User not found.');
    }

    // Store the code with the user's email
    verificationCodes.set(email, { code, createdAt: Date.now() });

    const transporter = nodemailer.createTransport({
      host: 'mail.r2619.us', // Incoming and outgoing server
      port: 465, // SMTP Port
      secure: true, // Use SSL/TLS
      auth: {
        user: 'server@r2619.us', // Your email address
        pass: 'Vancouver123@',
      },
    });

    const mailOptions = {
      from: 'server@r2619.us',
      to: email,
      subject: 'R2619 Password Reset Code',
      text: `Your verification code is: ${code}`,
    };

    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          res.send('Code sent to your email');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error to reset password:', error);
    return res.status(500).json({
      errors: [{ msg: 'Internal server error.' }],
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const newPassword = req.body.newPassword;

    const storedCode = verificationCodes.get(email);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (
      !storedCode ||
      storedCode.code !== code ||
      Date.now() - storedCode.createdAt > 15 * 60 * 1000
    ) {
      res.status(400).send('Invalid or expired code');
    } else {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          password: hashedPassword,
        },
      });
      // Update verification code status
      verificationCodes.delete(email);

      res.send('Password reset successfully');
    }
  } catch (error) {
    console.error('Error to reset password:', error);
    return res.status(500).json({
      errors: [{ msg: 'Internal server error.' }],
    });
  } finally {
    await prisma.$disconnect();
  }
};
