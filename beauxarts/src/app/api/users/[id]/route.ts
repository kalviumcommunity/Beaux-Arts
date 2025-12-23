import { NextResponse , NextRequest } from "next/server";

export async function GET({params}:{params:{id:string}}) {
    const {id} = params;
    
    const user = {
        id: parseInt(id),
        name: "Frank Brown",
        email: "grace@example.com"
    };

    try{
        return NextResponse.json(user);
    }catch(error){
        return NextResponse.json({ message: `Error fetching user with id ${id}.`,error }, { status: 500 });
    }
}

export async function DELETE(request:NextRequest,{params}:{params:{id:string}}) {
    const {id} = params;

    
    try{

        return NextResponse.json({ message: `User with id ${id} deleted successfully.` });
    }catch(error){
        return NextResponse.json({ message: `Error deleting user with id ${id}.`,error }, { status: 500 });
    }

}


export async function PUT(request:NextRequest,{params}:{params:{id:string}}) {
    const {id} = params;
    const body = await request.json();

    try{

        return NextResponse.json({ message: `User with id ${id} updated successfully.` });
    }catch(error){
        return NextResponse.json({ message: `Error updating user with id ${id}.`,error }, { status: 500 });
    }
}

export async function POST(request:NextRequest,{params}:{params:{id:string}}) {
    const {id} = params;
    const body = await request.json();

    try{

        return NextResponse.json({ message: `Post request to user with id ${id} successful.` });
    }catch(error){
        return NextResponse.json({ message: `Error in post request to user with id ${id}.`,error }, { status: 500 });
    }
}