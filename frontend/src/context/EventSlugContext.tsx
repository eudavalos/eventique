import { createContext, useContext } from 'react';

export const EventSlugContext = createContext<string>('default');
export const useEventSlug = () => useContext(EventSlugContext);
