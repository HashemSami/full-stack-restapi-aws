import { Router, Request, Response } from "express";

import { User } from "../models/User";

import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { NextFunction } from "connect";

import * as EmailValidator from "email-validator";
import { config } from "../../../../config/config";

const router: Router = Router();
const c = config.jwt;

async function generatePassword(plainTextPassword: string): Promise<string> {
  // Use Bcrypt to Generated Salted Hashed Passwords
  const rounds = 10;
  const salt = await bcrypt.genSalt(rounds);
  // this will mix the plain password with the generated hash
  const hash = await bcrypt.hash(plainTextPassword, salt);
  return hash;
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
  // Use Bcrypt to Compare your password to your Salted Hashed Password
  return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
  // Use jwt to create a new JWT Payload containing using the user information
  // and the secter code we porvide in the environment variables
  return jwt.sign({ user }, c.secret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // this will chack the header information we provided in the jwt before to the user when we singup the user to our app
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "No authorization headers." });
  }

  // the jwt will be on the format of
  // Bearer kjd;flkhjdf;ghkldf;jkhg;dfklj'sldofjlkj
  // so will split the token from the brearer then have more check the information
  const token_bearer = req.headers.authorization.split(" ");
  if (token_bearer.length != 2) {
    return res.status(401).send({ message: "Malformed token." });
  }

  const token = token_bearer[1];

  return jwt.verify(token, c.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: "Failed to authenticate." });
    }
    return next();
  });
}

router.get("/verification", requireAuth, async (req: Request, res: Response) => {
  return res.status(200).send({ auth: true, message: "Authenticated." });
});

router.post("/login", async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  // check email is valid
  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({ auth: false, message: "Email is required or malformed" });
  }

  // check email password valid
  if (!password) {
    return res.status(400).send({ auth: false, message: "Password is required" });
  }

  const user = await User.findByPk(email);
  // check that user exists
  if (!user) {
    return res.status(401).send({ auth: false, message: "Unauthorized" });
  }

  // check that the password matches
  const authValid = await comparePasswords(password, user.password_hash);

  if (!authValid) {
    return res.status(401).send({ auth: false, message: "Unauthorized" });
  }

  // Generate JWT
  const jwt = generateJWT(user);

  res.status(200).send({ auth: true, token: jwt, user: user.short() });
});

//register a new user
router.post("/", async (req: Request, res: Response) => {
  const email = req.body.email;
  const plainTextPassword = req.body.password;
  // check email is valid
  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({ auth: false, message: "Email is required or malformed" });
  }

  // check email password valid
  if (!plainTextPassword) {
    return res.status(400).send({ auth: false, message: "Password is required" });
  }

  // find the user
  const user = await User.findByPk(email);
  // check that user doesnt exists
  if (user) {
    return res.status(422).send({ auth: false, message: "User may already exist" });
  }

  const password_hash = await generatePassword(plainTextPassword);

  const newUser = await new User({
    email: email,
    password_hash: password_hash
  });

  let savedUser;
  try {
    savedUser = await newUser.save();
  } catch (e) {
    throw e;
  }

  // Generate JWT
  const jwt = generateJWT(savedUser);

  res.status(201).send({ token: jwt, user: savedUser.short() });
});

router.get("/", async (req: Request, res: Response) => {
  res.send("auth");
});

export const AuthRouter: Router = router;
