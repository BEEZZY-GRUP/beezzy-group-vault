import { createContext, useContext } from 'react';
import { DateFilterState, getDefaultFilterState } from '@/components/DateFilterBar';

const DateFilterContext = createContext<DateFilterState>(getDefaultFilterState());

export const DateFilterProvider = DateFilterContext.Provider;

export function useDateFilter() {
  return useContext(DateFilterContext);
}
