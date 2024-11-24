import { useState } from 'react';
import { University, Program } from '../models';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useUniversity = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequest = async <T>(
        request: Promise<T>,
        successMessage?: string
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await request;
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // University operations
    const createUniversity = async (university: University) => {
        return handleRequest(
            fetch(`${API_URL}/university/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(university),
            }).then(res => res.json())
        );
    };

    const getUniversity = async (universityId: number) => {
        return handleRequest(
            fetch(`${API_URL}/university/${universityId}`,{
                method: 'GET',
            }).then(res => res.json())
        );
    };

    const updateUniversity = async (universityId: number, updates: Partial<University>) => {
        return handleRequest(
            fetch(`${API_URL}/university/${universityId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            }).then(res => res.json())
        );
    };

    const deleteUniversity = async (universityId: number) => {
        return handleRequest(
            fetch(`${API_URL}/university/${universityId}`, {
                method: 'DELETE',
            }).then(res => res.json())
        );
    };

    // Program operations
    const addProgram = async (universityId: number, program: Program) => {
        return handleRequest(
            fetch(`${API_URL}/university/${universityId}/program/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(program),
            }).then(res => res.json())
        );
    };

    const getPrograms = async (universityId: number) => {
        return handleRequest(
            fetch(`${API_URL}/university/${universityId}/programs/`).then(res => res.json())
        );
    };

    const updateProgram = async (
        universityId: number,
        programName: string,
        programUpdate: Partial<Program>
    ) => {
        return handleRequest(
            fetch(
                `${API_URL}/university/${universityId}/program/${encodeURIComponent(programName)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(programUpdate),
                }
            ).then(res => res.json())
        );
    };

    const deleteProgram = async (universityId: number, programName: string) => {
        return handleRequest(
            fetch(
                `${API_URL}/university/${universityId}/program/${encodeURIComponent(programName)}`,
                {
                    method: 'DELETE',
                }
            ).then(res => res.json())
        );
    };

    return {
        loading,
        error,
        createUniversity,
        getUniversity,
        updateUniversity,
        deleteUniversity,
        addProgram,
        getPrograms,
        updateProgram,
        deleteProgram,
    };
};
