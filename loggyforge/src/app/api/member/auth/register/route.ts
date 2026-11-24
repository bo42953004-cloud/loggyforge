import { getPool, ensureSchema } from "@/db";
import { createMemberSession, hashPassword } from "@/lib/member/auth";
import { randomBytes } from "node:crypto";
import { isSameOrigin } from "@/lib/admin/auth";
export const dynamic = "force-dynamic";
function normalizePhone(input: string) { const digits=input.replace(/\D/g,""); if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`; if (/^254[17]\d{8}$/.test(digits)) return digits; return ""; }
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({error:"Invalid origin."},{status:403});
  let b: Record<string,unknown>; try { b=await request.json(); } catch { return Response.json({error:"Invalid request."},{status:400}); }
  const name=typeof b.name==="string"?b.name.trim().slice(0,160):""; const email=typeof b.email==="string"?b.email.trim().toLowerCase().slice(0,254):"";
  const password=typeof b.password==="string"?b.password:""; const phone=normalizePhone(typeof b.phone==="string"?b.phone:""); const referral=typeof b.referralCode==="string"?b.referralCode.trim().toUpperCase().slice(0,24):"";
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<10||password.length>128||!phone) return Response.json({error:"Enter your name, a valid email, a Kenyan M-Pesa number and a password of at least 10 characters."},{status:400});
  await ensureSchema(); const pool=getPool(); const client=await pool.connect();
  try { await client.query("BEGIN"); let referrerId:number|null=null;
    if(referral){ const r=await client.query('SELECT id FROM "members" WHERE "referral_code"=$1 AND "status"<>\'disabled\' LIMIT 1',[referral]); if(!r.rowCount) { await client.query("ROLLBACK"); return Response.json({error:"That referral code was not found."},{status:400}); } referrerId=Number(r.rows[0].id); }
    const code=`LG${randomBytes(5).toString("hex").toUpperCase()}`;
    const result=await client.query('INSERT INTO "members" ("name","email","password_hash","phone","referral_code","referred_by") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',[name,email,hashPassword(password),phone,code,referrerId]);
    await client.query("COMMIT");
    client.release();
    try { await createMemberSession(Number(result.rows[0].id)); return Response.json({ok:true,needsSubscription:true},{status:201}); }
    catch { return Response.json({error:"Your account was created, but the session could not be started. Please sign in."},{status:503}); }
  } catch(e) { await client.query("ROLLBACK"); const msg=e instanceof Error&&e.message.includes("members_email_key")?"An account with that email already exists.":"Could not create your account."; return Response.json({error:msg},{status:400}); } finally { try { client.release(); } catch { /* already released after commit */ } }
}
