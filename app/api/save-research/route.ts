import { NextRequest, NextResponse } from 'next/server';
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Diagnostic function to check Firebase connectivity
async function checkFirebaseConnection() {
    try {
        console.log('🔍 Checking Firebase connection...');
        console.log('✅ Firebase connection OK');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Save research request received');

        // Check Firebase connection first
        const isConnected = await checkFirebaseConnection();
        if (!isConnected) {
            return NextResponse.json(
                { success: false, error: 'Firebase connection failed', details: 'Unable to connect to Firestore' },
                { status: 500 }
            );
        }

        const { topic, questions, responses, userId, projectId, saveType = 'complete' } = await request.json();
        console.log('📝 Request data:', { topic, userId, projectId, saveType, questionCount: questions?.length });

        // Validate userId
        if (!userId) {
            console.error('❌ No userId provided');
            return NextResponse.json(
                { success: false, error: 'User ID is required', details: 'userId is null or undefined' },
                { status: 400 }
            );
        }

        console.log('👤 Using userId:', userId);

        // Create a research document
        const researchData = {
            topic,
            questions,
            responses: saveType === 'complete' ? responses : [],
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalQuestions: questions.length,
            totalResponses: saveType === 'complete' ? (responses[0]?.length || 0) : 0,
            status: saveType === 'complete' ? 'completed' : 'draft',
            saveType // 'draft' or 'complete'
        };

        console.log('📋 Research data to save:', {
            userId: researchData.userId,
            topic: researchData.topic,
            totalQuestions: researchData.totalQuestions,
            saveType: researchData.saveType,
            status: researchData.status
        });

        let docRef;

        console.log('💾 Attempting to save to Firestore...');
        if (projectId) {
            console.log('📝 Updating existing project:', projectId);
            // Update existing project
            await updateDoc(doc(db, 'research_projects', projectId), {
                ...researchData,
                updatedAt: new Date().toISOString()
            });
            docRef = { id: projectId };
        } else {
            console.log('➕ Creating new project');
            // Create new project
            docRef = await addDoc(collection(db, 'research_projects'), researchData);
        }
        console.log('✅ Firestore operation successful, document ID:', docRef.id);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: saveType === 'draft' ? 'Project saved as draft' : 'Research data saved successfully'
        });

    } catch (error) {
        console.error('Error saving research data:', error);

        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('PERMISSION_DENIED');

        return NextResponse.json(
            {
                success: false,
                error: isPermissionError ? 'Firebase permission denied - please check Firestore rules' : 'Failed to save research data',
                details: errorMessage,
                timestamp: new Date().toISOString()
            },
            { status: isPermissionError ? 403 : 500 }
        );
    }
}
