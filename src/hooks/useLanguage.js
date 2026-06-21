import { useContext } from 'react';
import LanguageContext from '../context/LanguageContext';

export const useLanguage = () => useContext(LanguageContext);

export default useLanguage;
