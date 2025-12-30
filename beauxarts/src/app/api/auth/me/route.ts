import {sendError, sendSuccess} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


export async function GET(req:NextRequest) {
    try{
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if(!token){
            return sendError({ message: `Authorization token missing.`, code:ERROR_CODES.UNAUTHORIZED, status:401 })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return sendSuccess({ data: {user:decoded}, message: "user fetched successfully." });

    }catch(error){
        return sendError({ message: `Error Fetching user.`, code:ERROR_CODES.INTERNAL_ERROR, details: error })

    }
}