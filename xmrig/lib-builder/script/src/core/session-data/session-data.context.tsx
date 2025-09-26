import React from 'react';

export interface SessionDataContextType {
  CPUTemp: number;
}

export const SessionDataContext: React.Context<SessionDataContextType> = React.createContext({
  CPUTemp: 45.0
});