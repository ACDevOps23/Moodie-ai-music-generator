import { Request, Response, NextFunction } from "express";
import { body, ValidationChain, validationResult } from "express-validator";

// A middleware to handle validation results
export const validator = (validations: ValidationChain[]) => { // returns a middleware function   
    return async (req: Request, res: Response, next: NextFunction) => { 
        for (let validation of validations) { // run each validation
            const result = await validation.run(req); // execute the validation
            if (!result.isEmpty()) { 
                break;
            }
        }
         const errors = validationResult(req); 
            if (errors.isEmpty()) { // if no errors, proceed to next middleware
               return next();
            }
            res.status(422).json({errors: errors.array()});
    }
}

// Validators for login and signup
export const loginValidator = [
    body("email").trim().isEmail().notEmpty().withMessage("email is required"),
    body("password").isStrongPassword().notEmpty().trim().withMessage("password should be strong"),
];

export const signUpValidator = [
    body("firstName").escape().trim().notEmpty().withMessage("firstname is required"),
    body("lastName").escape().trim().notEmpty().withMessage("lastname is required"),
    ...loginValidator
];