import React, { createContext, useContext, useState } from 'react';

// Define the context
interface TupleContextType {
  tuple: [string, string, string, string, string, number, number, number, number];
  setTuple: React.Dispatch<React.SetStateAction<[string, string, string, string, string, number, number, number, number]>>;
}

const TupleContext = createContext<TupleContextType | undefined>(undefined);

// Define a provider component that wraps your app
export const TupleProvider: React.FC = ({ children }) => {
  const [tuple, setTuple] = useState<[string, string, string, string, string, number, number, number, number]>(['', '', '', '', '', 0, 0, 0, 0]);

  return (
    <TupleContext.Provider value={{ tuple, setTuple }}>
      {children}
    </TupleContext.Provider>
  );
};

// Custom hook for accessing the context
export const useTuple = () => {
  const context = useContext(TupleContext);
  if (!context) {
    throw new Error('useTuple must be used within a TupleProvider');
  }
  return context;
};