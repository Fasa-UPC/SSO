import bcrypt from "bcrypt";

const hash = async (value: string) => {
  const hashValue = await bcrypt.hash(value, 10);

  return hashValue;
};

const compare = async (hashValue: string, rawValue: string) => {
  const isSame = await bcrypt.compare(rawValue, hashValue);

  return isSame;
};

export { hash, compare };
