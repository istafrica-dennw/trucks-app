import Joi from 'joi';

export const daily = Joi.object({
  date: Joi.date().iso().required()
});

export const weekly = Joi.object({
  week: Joi.string().pattern(/^\d{4}-W\d{2}$/).required()
});

export const monthly = Joi.object({
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
});

export const custom = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day')
});

