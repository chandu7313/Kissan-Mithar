import { Request, Response, NextFunction } from 'express';
import { ExpertService } from '../services/expert.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const listExperts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experts = await ExpertService.listExperts();
    res.status(200).json({
      status: 'success',
      data: experts,
    });
  } catch (error) {
    next(error);
  }
};

export const createExpert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phoneNumber, specialization, experienceYears, password } = req.body;

    if (!name || !email || !phoneNumber || !specialization || experienceYears === undefined) {
      throw new AppError('Name, email, phone number, specialization, and experience years are required', 400);
    }

    const expert = await ExpertService.createExpert({
      name,
      email,
      phoneNumber,
      specialization,
      experienceYears: Number(experienceYears),
      password,
    });

    res.status(201).json({
      status: 'success',
      message: 'Expert created successfully',
      data: expert,
    });
  } catch (error) {
    next(error);
  }
};
