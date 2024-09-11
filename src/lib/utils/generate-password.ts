const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()<>.?/[]{}-=_+|/0123456789";

const non_breaking_characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const getRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generatePassword = (length: number) => {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[getRandomInteger(0, characters.length - 1)];
  }
  return password;
};

export const generateNonBreaking = (length: number) => {
  let password = "";
  for (let i = 0; i < length; i++) {
    password +=
      non_breaking_characters[
        getRandomInteger(0, non_breaking_characters.length - 1)
      ];
  }
  return password;
};
