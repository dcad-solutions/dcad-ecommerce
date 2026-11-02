'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WizardNavState {
  screen: string;
  setScreen: (s: string) => void;
  dentistNome: string | null;
  setDentistNome: (nome: string | null) => void;
}

const WizardNavContext = createContext<WizardNavState>({
  screen: '',
  setScreen: () => {},
  dentistNome: null,
  setDentistNome: () => {},
});

export function WizardNavProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState('');
  const [dentistNome, setDentistNome] = useState<string | null>(null);

  return (
    <WizardNavContext.Provider value={{ screen, setScreen, dentistNome, setDentistNome }}>
      {children}
    </WizardNavContext.Provider>
  );
}

export function useWizardNav() {
  return useContext(WizardNavContext);
}
