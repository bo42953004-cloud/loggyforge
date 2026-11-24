import SheetClient from "@/components/sheet/SheetClient";
import { getCurrentMember } from "@/lib/member/auth";
import { redirect } from "next/navigation";
export const metadata={title:"Spreadsheet · LOGGYFORGE"};
export const dynamic="force-dynamic";
export default async function SheetPage(){const member=await getCurrentMember();if(!member)redirect("/login");const expiry=member.subscription_expires_at?new Date(member.subscription_expires_at as string|Date).getTime():0;if(member.is_owner!==true&&(member.status!=="active"||expiry<=Date.now()))redirect("/account/subscribe");return <SheetClient/>;}
