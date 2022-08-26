import * as Joi from "joi";

export interface AddBusinessDTO {
  title: string;
  description: string;
  asSlide: boolean;
  content: string;
}

export const addBusinessSchema = Joi.object<AddBusinessDTO>({
  title: Joi.string().required(),
  description: Joi.string().required(),
  asSlide: Joi.boolean(),
  content: Joi.string().required(),
});
