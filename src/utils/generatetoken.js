import jwt from "jsonwebtoken";
export const generatetoken = (id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "444d",
  });
  return token;
};
