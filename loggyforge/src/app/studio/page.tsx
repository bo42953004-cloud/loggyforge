import StudioClient from "@/components/studio/StudioClient";
import { getCurrentMember } from "@/lib/member/auth";
import { redirect } from "next/navigation";
export const metadata={title:"Code Studio · LOGGYFORGE"};
export const dynamic="force-dynamic";
export default async function StudioPage(){const member=await getCurrentMember();if(!member)redirect("/login");const expiry=member.subscription_expires_at?new Date(member.subscription_expires_at as string|Date).getTime():0;if(member.is_owner!==true&&(member.status!=="active"||expiry<=Date.now()))redirect("/account/subscribe");return <StudioClient/>;}
