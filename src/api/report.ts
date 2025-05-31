import axios from 'axios';
import { useContext } from 'react';
// import { billingDataContext } from '../contexts/DataContext';
import { useDispatch } from 'react-redux';
// import { setReportData } from '../store/reportSlice';

export default function useReportApi() {
  const dispatch = useDispatch();
  //   const { invoice, setInvoice } = useContext(billingDataContext);
  const getInvoice = async () => {
    try {
      const response = await axios.get(
        'https://inventory-backend-azure.vercel.app/api/reports/getInvoice',
      );
    //   dispatch(setReportData(response.data.data)); //   setInvoice(response);
      return response;
    } catch (err) {
      console.error(err);
    }
  };

  return {
    getInvoice,
  };
}
// export const getInvoice =
//   'https://inventory-backend-azure.vercel.app/api/reports/getInvoice';
