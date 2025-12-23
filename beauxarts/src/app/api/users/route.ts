import { NextResponse,NextRequest } from "next/server";


export async function GET(){
    try{
        const users = [
            { id: 1, name: "Alice Example", email:""},
            { id: 2, name: "Bob Example", email:""},
            { id: 3, name: "Carol Davidson", email:""},
            { id: 4, name: "David Miller", email:""},
            { id: 5, name: "Emma Wilson", email:""},
            { id: 6, name: "Frank Brown", email:""},
            { id: 7, name: "Grace Taylor", email:""},
        ];
        return NextResponse.json(users);
    }catch(error){
        return NextResponse.json({ message: "Error fetching users.",error }, { status: 500 });
    }
}


export async function POST(request:NextRequest) {
    const body = await request.json();

    try{

        return NextResponse.json({ message: `User created successfully.` });
    }catch(error){
        return NextResponse.json({ message: `Error creating user.`,error }, { status: 500 });
    }
}