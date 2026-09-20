import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import './index.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'Inter, sans-serif',
              colorPrimary: '#3C50E0',
              colorText: '#1C2434',
              colorTextSecondary: '#64748B',
              borderRadius: 10,
            },
            components: {
              Table: {
                headerBg: '#F7F9FC',
                headerColor: '#64748B',
                headerSplitColor: 'transparent',
                rowHoverBg: '#F8FAFF',
                borderColor: '#EEF2F6',
                cellPaddingBlock: 14,
                cellPaddingInline: 16,
              },
              Button: { fontWeight: 500 },
              Modal: { borderRadiusLG: 16 },
            },
          }}
        >
          <App />
        </ConfigProvider>
        <ToastContainer />
      </Router>
    </Provider>
  </React.StrictMode>,
);
