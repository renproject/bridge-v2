import { useEffect } from 'react'
import { createStateContext } from 'react-use'

const [usePaperTitle, PaperTitleProvider] = createStateContext("Transaction");

export const useSetPaperTitle = (title: string) => {
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};

export { PaperTitleProvider, usePaperTitle };
