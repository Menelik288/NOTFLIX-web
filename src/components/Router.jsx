import React from 'react';
import { useApp } from '../context/AppContext';

export const Route = ({ path, element }) => {
    const { currentRoute } = useApp();
    
    // Clean hash path (e.g., #/movies -> /movies)
    const cleanPath = currentRoute.replace('#', '') || '/';
    
    // Match template routes like /movie/:id or /genre/:name
    const matchRoute = (template, actual) => {
        const paramNames = [];
        const regexPath = template
            .replace(/([:*])(\w+)/g, (full, type, paramName) => {
                paramNames.push(paramName);
                return '([^/]+)';
            })
            .replace(/\//g, '\\/');
            
        const regexp = new RegExp('^' + regexPath + '$');
        
        // Split path from search parameters (e.g., /search?q=nebula)
        const [pathPart, queryPart] = actual.split('?');
        const match = pathPart.match(regexp);
        
        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = decodeURIComponent(match[index + 1]);
            });
            
            // Extract query parameters
            const queryParams = {};
            if (queryPart) {
                const searchParams = new URLSearchParams(queryPart);
                for (const [key, value] of searchParams.entries()) {
                    queryParams[key] = value;
                }
            }
            
            return { matches: true, params: { ...params, query: queryParams } };
        }
        return { matches: false };
    };

    const { matches, params } = matchRoute(path, cleanPath);
    
    if (matches) {
        // Return cloned element passing down route parameters
        return React.cloneElement(element, { params });
    }
    
    return null;
};
