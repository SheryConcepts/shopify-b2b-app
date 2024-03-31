import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export async function sign(
  payload: JWTPayload,
  secret: string,
  exp?: string,
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp ? exp : "24h")
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
}

type UserSession = { email: string };

export async function verify(
  token: string,
  secret: string,
): Promise<UserSession | undefined> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    console.log(payload, "payload from verify");
    return { email: payload.email as string };
  } catch (e) {
    console.error(e);
    return undefined;
  }
  // run some checks on the returned payload, perhaps you expect some specific values

  // if its all good, return it, or perhaps just return a boolean
}

export default async function isSignedIn() {
  const token = cookies().get("Authorization")?.value.split("Bearer ")[1] ?? "";
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not provided");
  return !!(await verify(token, process.env.JWT_SECRET));
}

export async function signOut() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not provided");
  const invalidToken = await sign(
    { sub: "unauthorized" },
    process.env.JWT_SECRET,
    "-24h",
  );
  cookies().set("Authorization", invalidToken);
  return;
}

export async function getServerSideSession() {
  const token = cookies().get("Authorization")?.value.split("Bearer ")[1] ?? "";
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not provided");
  return await verify(token, process.env.JWT_SECRET);
}
