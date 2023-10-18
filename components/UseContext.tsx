import React, { createContext, useContext, ReactNode, useState } from 'react';

interface MyContextData {
  data : string;
  order : number;
  active : boolean;
  setData: (value:string) => void;
  setOrder: (value:number) => void;
  setActive: (value:boolean) => void;
}

interface MyContextProviderProps {
  children: ReactNode;
}

const MyContext = createContext<MyContextData | undefined>(undefined);

export const useData = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
};

export const MyContextProvider: React.FC<MyContextProviderProps> = ({ children }) => {
  // You can initialize your data here
  const [data, setData] =  useState<string>('inActive');
  const [order, setOrder] = useState<number>(0);
  const [active, setActive] = useState<boolean>(false);

  const contextValue: MyContextData = {
    data,
    order,
    active,
    setData,
    setOrder,
    setActive,
  };

  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};


// import React, { createContext, useContext, useState, ReactNode } from 'react';

// const DataContext = createContext<any | undefined>(undefined);

// export function useData() {
//   const context = useContext(DataContext);
//   if (!context) {
//     throw new Error('useData must be used within a DataProvider');
//   }
//   return context;
// }

// export function DataProvider({ children }) {
//   const [data, setData] = useState('');

//   return (
//     <DataContext.Provider value={{ data, setData }}>
//       {children}
//     </DataContext.Provider>
//   );
// }
