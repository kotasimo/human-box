"use client"

import { useParams } from "next/navigation"


const PersonPage = () => {
    const params = useParams();
    const id = params.id as string;

    return (
        <main>
            <h1>Person Page</h1>
            <p>ID: {id}</p>
        </main>
    );
}

export default PersonPage