import { sendError,sendSuccess } from "@/lib/responseHandler";
import prisma from "@/lib/prisma";


export async function GET(){
    try{
        const artists =  await prisma.artist.findMany({
            orderBy: { storeName: 'asc' }
        });
        return sendSuccess({data: artists});

    }catch(error){
        return sendError({message: `Error fetching artists.`, details: error});
    }
}