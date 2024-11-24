'use client';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';

const characters = [
    {
        no: 101,
        voiceCharcter: "Joey",
        accent: "English (US)",
        countryCode: "US"
    },
    {
        no: 102,
        voiceCharcter: "Aditi",
        accent: "English (Indian)",
        countryCode: "IN"
    },
    {
        no: 103,
        voiceCharcter: "Brian",
        accent: "English (British)",
        countryCode: "GB"
    },
    {
        no: 104,
        voiceCharcter: "Raveena",
        accent: "English (Indian)",
        countryCode: "IN"
    },
    {
        no: 105,
        voiceCharcter: "Russell",
        accent: "English (Australian)",
        countryCode: "AU"
    },
    {
        no: 106,
        voiceCharcter: "Nicole",
        accent: "English (Australian)",
        countryCode: "AU"
    },
];

export default function CharacterList({ onCharacterSelect, selectedCharacter }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {characters.map((character) => {
                const isSelected = selectedCharacter?.no === character.no;
                return (
                    <div
                        key={character.no}
                        onClick={() => onCharacterSelect(character)}
                        className={`cursor-pointer border rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${
                            isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                                : 'border-gray-200 bg-white hover:border-blue-200 hover:scale-102'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                {character.voiceCharcter}
                            </h3>
                            <ReactCountryFlag
                                countryCode={character.countryCode}
                                svg
                                style={{
                                    width: '2.5em',
                                    height: '2.5em',
                                }}
                                title={character.accent}
                            />
                        </div>
                        <div className={`flex items-center justify-between ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                            <p className="text-base">{character.accent}</p>
                            {isSelected && (
                                <div className="flex items-center text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
