import { useState, useEffect } from 'react';
import MessageList from './MessageList';

export default function SearchModal({ isOpen, setIsOpen, token, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const searchMessages = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }
        
        try {

            const response = await fetch(`http://localhost:2222/api/searchMessages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ searchTerm: term })
            });
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching messages:', error);
            setSearchResults([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchMessages(searchTerm);
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [setIsOpen]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 w-full h-full max-w-2xl max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-4">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Press enter to search"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </form>
        
                <div className="flex-1 overflow-y-auto min-h-0">
                    <MessageList messages={searchResults} users={users} token={token} isThreadView={true} placeholder={searchResults.length === 0 ? 'No results yet' : ''}/>
                </div>
            </div>
        </div>
    )
} 