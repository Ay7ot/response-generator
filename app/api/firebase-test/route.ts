import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, limit, addDoc, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        console.log('Creating test document...');

        // Get the authenticated user ID from the request
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId') || 'anonymous';

        const testDoc = {
            userId: userId,
            topic: 'Test Research Project',
            questions: [
                { text: 'What is your age?', type: 'single', options: [{ text: '18-24', percentage: 25 }] }
            ],
            responses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalQuestions: 1,
            totalResponses: 0,
            status: 'draft',
            saveType: 'draft'
        };

        const docRef = await addDoc(collection(db, 'research_projects'), testDoc);

        console.log('Test document created with ID:', docRef.id);

        return NextResponse.json({
            success: true,
            message: 'Test document created',
            documentId: docRef.id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error creating test document:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Firebase diagnostic test starting...');
        try {
            console.log('Testing Firebase connection...');

            // Test 1: Basic connection test
            console.log('Firebase config check:', {
                hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            });

            // Test 2: Try to access a collection
            try {
                const testCollection = collection(db, 'research_projects');
                console.log('Collection reference created successfully');

                // First, try a simple query without filters
                const simpleQuery = query(testCollection, limit(5));
                const simpleSnapshot = await getDocs(simpleQuery);
                console.log('Simple query successful, found:', simpleSnapshot.size, 'documents');

                // Now test the problematic compound query
                try {
                    const compoundQuery = query(
                        testCollection,
                        where('userId', '==', 'test-user'),
                        orderBy('updatedAt', 'desc'),
                        limit(5)
                    );
                    const compoundSnapshot = await getDocs(compoundQuery);
                    console.log('Compound query successful, found:', compoundSnapshot.size, 'documents');
                } catch (compoundError) {
                    console.log('Compound query failed:', compoundError);
                    // This is expected if there are no documents or indexing issues
                }

                // Log document details for debugging
                simpleSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    console.log('Document ID:', doc.id);
                    console.log('Document data:', {
                        userId: data.userId,
                        topic: data.topic,
                        totalQuestions: data.totalQuestions,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    });
                });

                return NextResponse.json({
                    success: true,
                    message: 'Firebase connection successful',
                    documentsFound: simpleSnapshot.size,
                    collectionExists: true,
                    hasCompoundQueryTest: true,
                    timestamp: new Date().toISOString()
                });

            } catch (collectionError) {
                console.log('Collection access error:', collectionError);
                return NextResponse.json({
                    success: false,
                    error: 'Collection access failed',
                    details: collectionError instanceof Error ? collectionError.message : 'Unknown collection error',
                    collectionExists: false,
                    timestamp: new Date().toISOString()
                }, { status: 500 });
            }

        } catch (error) {
            console.error('Firebase connection error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown Firebase error',
                    firebaseInitialized: true,
                    timestamp: new Date().toISOString()
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error running Firebase diagnostic test:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

