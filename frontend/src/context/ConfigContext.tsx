import { createContext, useContext } from 'react';
import type { WeddingConfig } from '../types';
import { config as staticConfig } from '../config/wedding';

export const ConfigContext = createContext<WeddingConfig>(staticConfig);
export const useConfig = () => useContext(ConfigContext);
