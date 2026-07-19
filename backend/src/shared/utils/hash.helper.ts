import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRoundsStr = process.env.BCRYPT_SALT_ROUNDS;
  const rounds = saltRoundsStr ? Number(saltRoundsStr) : 10;
  const saltRounds = Number.isInteger(rounds) && rounds > 0 ? rounds : 10;
  return bcrypt.hash(password, saltRounds);
}
