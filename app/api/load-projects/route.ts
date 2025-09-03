import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        console.log('Loading projects for user:', userId);

        // First, let's check if the collection exists and get a count
        try {
            const testQuery = query(collection(db, 'research_projects'));
            const testSnapshot = await getDocs(testQuery);
            console.log('Total documents in collection:', testSnapshot.size);

            // Check what documents exist
            testSnapshot.docs.forEach(doc => {
                console.log('Document:', doc.id, 'Data:', doc.data());
            });
        } catch (testError) {
            console.log('Error checking collection:', testError);
        }

        // Query projects for this user
        const q = query(
            collection(db, 'research_projects'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        console.log('Executing Firestore query for user:', userId);
        const querySnapshot = await getDocs(q);
        console.log('Query completed, found', querySnapshot.docs.length, 'documents for user');

        const projects = [];

        for (const docSnap of querySnapshot.docs) {
            const projectData = docSnap.data();
            console.log('Processing document:', docSnap.id, projectData);
            projects.push({
                id: docSnap.id,
                ...projectData,
                // Convert Firestore timestamps to ISO strings
                createdAt: projectData.createdAt?.toDate?.()?.toISOString() || projectData.createdAt,
                updatedAt: projectData.updatedAt?.toDate?.()?.toISOString() || projectData.updatedAt,
            });
        }

        console.log('Returning', projects.length, 'projects');
        return NextResponse.json({
            success: true,
            projects,
            total: projects.length
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        return NextResponse.json(
            { success: false, error: `Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { projectId } = await request.json();

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: 'Project ID is required' },
                { status: 400 }
            );
        }

        // Get specific project
        const docRef = doc(db, 'research_projects', projectId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        const projectData = docSnap.data();

        return NextResponse.json({
            success: true,
            project: {
                id: docSnap.id,
                ...projectData,
                // Convert Firestore timestamps to ISO strings
                createdAt: projectData.createdAt?.toDate?.()?.toISOString() || projectData.createdAt,
                updatedAt: projectData.updatedAt?.toDate?.()?.toISOString() || projectData.updatedAt,
            }
        });

    } catch (error) {
        console.error('Error loading project:', error);
        return NextResponse.json(
            { success: false, error: `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
