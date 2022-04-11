import type { ActionFunction } from "@remix-run/node";
import { calculatePairs } from "~/utils/algorithm";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { roomName } = Object.fromEntries(body);
  await calculatePairs(roomName);
  return null;
};
